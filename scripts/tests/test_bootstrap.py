import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[2]


class BootstrapTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "scripts").mkdir()
        for filename in ("package.json", "bun.lock", "scripts/bootstrap.py"):
            shutil.copy2(SOURCE / filename, self.root / filename)
        for filename in (".env", ".env.local", ".env.production", "credential.pem"):
            (self.root / filename).write_bytes(b"dummy-private-fixture\x00\xff")

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(self.root / "scripts/bootstrap.py"), *args], cwd=self.temp.name, capture_output=True, text=True, timeout=10)

    def snapshot(self):
        return {str(path.relative_to(self.root)): path.read_bytes() for path in self.root.rglob("*") if path.is_file()}

    def test_dry_run_no_writes_and_same_plan(self):
        before = self.snapshot()
        result = self.run_cli("--name", "my-app", "--dry-run")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Would update package.json", result.stdout)
        self.assertIn("Would update bun.lock", result.stdout)
        self.assertEqual(before, self.snapshot())

    def test_rename_preserves_everything_else_and_is_idempotent(self):
        before = self.snapshot()
        result = self.run_cli("--name", "my-app")
        self.assertEqual(result.returncode, 0, result.stderr)
        package = json.loads((self.root / "package.json").read_text())
        self.assertEqual(package.pop("name"), "my-app")
        old_package = json.loads(before["package.json"])
        old_name = old_package.pop("name")
        self.assertEqual(package, old_package)
        self.assertEqual((self.root / "bun.lock").read_text(), before["bun.lock"].decode().replace(f'"name": "{old_name}"', '"name": "my-app"', 1))
        after = self.snapshot()
        for filename in before.keys() - {"package.json", "bun.lock"}:
            self.assertEqual(before[filename], after[filename])
        self.assertEqual(self.run_cli("--name", "my-app").returncode, 0)
        self.assertEqual(after, self.snapshot())

    def test_preserves_crlf(self):
        name = json.loads((self.root / "package.json").read_bytes())["name"]
        for filename in ("package.json", "bun.lock"):
            path = self.root / filename
            path.write_bytes(path.read_bytes().replace(b"\n", b"\r\n"))
        before = self.snapshot()
        result = self.run_cli("--name", "my-app")
        self.assertEqual(result.returncode, 0, result.stderr)
        for filename in ("package.json", "bun.lock"):
            expected = before[filename].replace(f'"name": "{name}"'.encode(), b'"name": "my-app"', 1)
            self.assertEqual((self.root / filename).read_bytes(), expected)

    def test_invalid_package_shape_never_writes(self):
        for payload in ([], None, {"name": 1}):
            (self.root / "package.json").write_text(json.dumps(payload))
            before = self.snapshot()
            result = self.run_cli("--name", "my-app")
            self.assertEqual(result.returncode, 1)
            self.assertNotIn("Traceback", result.stderr)
            self.assertEqual(before, self.snapshot())

    def test_invalid_names_never_write(self):
        before = self.snapshot()
        for name in ("", "../escape", "/tmp/escape", "UPPER", "with space", "x;touch owned", "x\ny", "@scope/name", "é", "1app", "a_1", "a--b", "a-", "a" * 65, "npm"):
            with self.subTest(name=name):
                self.assertNotEqual(self.run_cli("--name", name).returncode, 0)
                self.assertEqual(before, self.snapshot())
        self.assertNotEqual(self.run_cli().returncode, 0)

    def test_mismatched_lock_fails_before_writing(self):
        path = self.root / "bun.lock"
        name = json.loads((self.root / "package.json").read_text())["name"]
        path.write_text(path.read_text().replace(f'"name": "{name}"', '"name": "different"', 1))
        before = self.snapshot()
        self.assertNotEqual(self.run_cli("--name", "my-app").returncode, 0)
        self.assertEqual(before, self.snapshot())

    def test_reject_symlink_and_hardlink_targets_without_touching_external(self):
        with tempfile.TemporaryDirectory() as external:
            target = Path(external) / "package.json"
            package = self.root / "package.json"
            original = package.read_bytes()
            target.write_bytes(original)
            package.unlink()
            package.symlink_to(target)
            self.assertNotEqual(self.run_cli("--name", "my-app").returncode, 0)
            self.assertEqual(target.read_bytes(), original)
            package.unlink()
            os.link(target, package)
            self.assertNotEqual(self.run_cli("--name", "my-app").returncode, 0)
            self.assertEqual(target.read_bytes(), original)

    def test_missing_or_invalid_file_leaves_package_unchanged(self):
        package = (self.root / "package.json").read_bytes()
        (self.root / "bun.lock").unlink()
        self.assertNotEqual(self.run_cli("--name", "my-app").returncode, 0)
        self.assertEqual((self.root / "package.json").read_bytes(), package)


if __name__ == "__main__":
    unittest.main()
