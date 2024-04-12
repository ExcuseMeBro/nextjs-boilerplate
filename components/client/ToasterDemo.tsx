import {Button} from "@/components/ui/button";
import {showToaster} from "@/lib/customToaster";

export default function ToasterDemo() {
    return (
        <Button onClick={() => showToaster("Hello Sonner!")}>Show toaster</Button>
    );
}