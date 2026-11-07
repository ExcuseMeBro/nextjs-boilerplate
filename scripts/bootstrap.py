#!/usr/bin/env python3
"""Rename only the root npm package and its Bun lock workspace (Python 3.9+)."""

import argparse
import json
import os
from pathlib import Path
import re
import stat
import tempfile

ROOT = Path(__file__).resolve().parent.parent
NAME = re.compile(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", re.ASCII)
LOCK_NAME = re.compile(r'("workspaces"\s*:\s*\{\s*""\s*:\s*\{\s*"name"\s*:\s*)("(?:[^"\\]|\\.)*")')
PACKAGE_NAME = re.compile(r'(^  "name": )("(?:[^"\\]|\\.)*")', re.MULTILINE)


def package_name(value):
    if len(value) > 64 or not NAME.fullmatch(value) or value in {"node", "npm", "bun"}:
        raise argparse.ArgumentTypeError("name must be 1-64 lowercase ASCII letters/digits with single internal hyphens, start with a letter, and not be node/npm/bun")
    return value


def plan(name):
    contents = {}
    for filename in ("package.json", "bun.lock"):
        path = ROOT / filename
        metadata = path.lstat()
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink != 1:
            raise ValueError(f"{filename} must be a regular, non-symlink, non-hardlinked file")
        if metadata.st_size > 2_000_000:
            raise ValueError(f"{filename} exceeds the 2 MB safety limit")
        contents[filename] = path.read_bytes().decode("utf-8")
    package = json.loads(contents["package.json"])
    if not isinstance(package, dict) or not isinstance(package.get("name"), str):
        raise ValueError("package.json must contain an object with a string name")
    old_name = package["name"]
    changes = []
    for filename, pattern in (("package.json", PACKAGE_NAME), ("bun.lock", LOCK_NAME)):
        matches = list(pattern.finditer(contents[filename]))
        if len(matches) != 1 or json.loads(matches[0][2]) != old_name:
            raise ValueError(f"{filename}: expected exactly one matching root package name; no files changed")
        updated = pattern.sub(lambda match: match[1] + json.dumps(name), contents[filename], count=1)
        if updated != contents[filename]:
            changes.append((ROOT / filename, updated))
    return old_name, changes


def apply(changes):
    # Prepare every file before replacing any; never traverse or rewrite arbitrary files.
    staged = []
    try:
        for path, contents in changes:
            fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.bootstrap-", dir=ROOT)
            staged.append((Path(temporary), path))
            with os.fdopen(fd, "w", encoding="utf-8", newline="") as stream:
                os.fchmod(stream.fileno(), stat.S_IMODE(path.stat().st_mode))
                stream.write(contents)
                stream.flush()
                os.fsync(stream.fileno())
        for temporary, path in staged:
            os.replace(temporary, path)
    finally:
        for temporary, _ in staged:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", required=True, type=package_name)
    parser.add_argument("--dry-run", action="store_true", help="print planned changes without writing")
    args = parser.parse_args()
    try:
        old_name, changes = plan(args.name)
        for path, _ in changes:
            print(f"{'Would update' if args.dry_run else 'Update'} {path.name}: {old_name!r} -> {args.name!r}")
        if not args.dry_run:
            apply(changes)
        if not changes:
            print("Already configured; no changes.")
    except (OSError, ValueError, TypeError) as error:
        parser.exit(1, f"bootstrap: {error}\n")


if __name__ == "__main__":
    main()
