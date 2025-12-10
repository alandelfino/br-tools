import { Images, Upload } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState } from "react";
import { CropperItem } from "./cropper-item";
import type { ImageItem, Area, Point } from "@/types";

export function Page() {
    const [items, setItems] = useState<ImageItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const createImageItem = (file: File): Promise<ImageItem | null> => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                resolve({
                    id: Math.random().toString(36).slice(2),
                    url,
                    originalWidth: img.naturalWidth,
                    originalHeight: img.naturalHeight,
                    filename: file.name,
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: null,
                });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        });
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
        const created = await Promise.all(fileArray.map(createImageItem));
        const filtered = created.filter((i): i is ImageItem => i !== null);
        setItems((prev) => [...prev, ...filtered]);
    }, []);

    const openPicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
        }
    }, [handleFiles]);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const { files } = e.dataTransfer;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const onCropChange = useCallback((id: string, crop: Point) => {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, crop } : it)));
    }, []);

    const onZoomChange = useCallback((id: string, zoom: number) => {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, zoom } : it)));
    }, []);

    const onCropComplete = useCallback((id: string, _area: Area, areaPixels: Area) => {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, croppedAreaPixels: areaPixels } : it)));
    }, []);

    const onRemove = useCallback((id: string) => {
        setItems((prev) => {
            const target = prev.find((i) => i.id === id);
            if (target) URL.revokeObjectURL(target.url);
            return prev.filter((it) => it.id !== id);
        });
    }, []);

    return (
        <div className="w-screen h-[calc(100vh-66px)] flex bg-white">
            <Sidebar />
            <div className="flex-1 p-8 bg-neutral-50">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
                {items.length === 0 ? (
                    <div onDragOver={onDragOver} onDrop={onDrop} className="w-full h-full rounded-lg border-2 border-dashed flex flex-col gap-2 items-center justify-center">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Images className="w-6 h-6 text-neutral-500" />
                        </div>
                        <span className="text-neutral-800 text-lg font-semibold">No images uploaded</span>
                        <span className="text-neutral-400 text-xs">Drag and drop images here or click to upload</span>
                        <Button onClick={openPicker} className="bg-neutral-800 text-white text-xs px-4 py-2 rounded-md mt-4">
                            <Upload className="w-4 h-4 mr-2" />Upload Images
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">{items.length} images</span>
                            <Button onClick={openPicker} variant="outline" className="text-xs">
                                <Upload className="w-4 h-4 mr-2" />Add more
                            </Button>
                        </div>
                        <div className="grid xl:grid-cols-3 gap-6 overflow-auto pr-1">
                            {items.map((item) => (
                                <CropperItem
                                    key={item.id}
                                    item={item}
                                    targetAspect={1}
                                    zoomSpeed={0.1}
                                    onCropChange={onCropChange}
                                    onZoomChange={onZoomChange}
                                    onCropComplete={onCropComplete}
                                    onRemove={onRemove}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
