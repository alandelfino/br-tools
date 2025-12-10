import { Images, Upload } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Button } from "@/components/ui/button";

export function Page() {
    return (
        <div className="w-screen h-[calc(100vh-66px)] flex bg-white">

            {/* Sidebar */}
            <Sidebar />

            {/* Wrapper */}
            <div className="flex-1 p-8 bg-neutral-50">

                <div className="w-full h-full rounded-lg border-2 border-dashed flex flex-col gap-2 items-center justify-center">

                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Images className="w-6 h-6 text-neutral-500" />
                    </div>
                    <span className="text-neutral-800 text-lg font-semibold">No images uploaded</span>
                    <span className="text-neutral-400 text-xs">Drag and drop images here or click to upload</span>
                    <Button className="bg-neutral-800 text-white text-xs px-4 py-2 rounded-md mt-4">
                        <Upload className="w-4 h-4 mr-2" />Upload Images
                    </Button>
                </div>

            </div>

        </div>
    )
}