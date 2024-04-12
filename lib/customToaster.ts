import {toast} from "sonner";

export function showToaster(massage: string, type?: string) {
    toast(massage)
}