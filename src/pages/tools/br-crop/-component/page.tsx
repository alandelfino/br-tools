import { Images } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function Page() {
    return (
        <div className="w-screen h-screen flex bg-white">

            {/* Sidebar */}
            <Sidebar />

            {/* Wrapper */}
            <div className="flex-1 p-8 bg-neutral-50">

                <div className="w-full h-full rounded-lg border-2 border-dashed flex flex-col gap-2 items-center justify-center">

                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Images className="w-6 h-6 text-neutral-500" />
                    </div>
                    <span className="text-neutral-800 text-lg font-semibold">No images uploaded</span>
                    <span className="text-neutral-400 text-xs">Upload images from the sidebar to start cropping</span>

                </div>

            </div>

        </div>
    )
}