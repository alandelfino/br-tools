import { Check, Images, Plus, Upload } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";
import { useCallback, useRef, useState } from "react";
import { CropperItem } from "./cropper-item";
import type { ImageItem, Area, Point } from "@/types";
import { FieldSeparator } from "@/components/ui/field";
import { ImportProgressDialog } from "./import-progress-dialog";
import { AuthPromptDialog } from "./auth-prompt-dialog";

export function Page() {
    const [items, setItems] = useState<ImageItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [authPromptVisible, setAuthPromptVisible] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importTotal, setImportTotal] = useState(0);
    const [importDone, setImportDone] = useState(0);
    const [cropWidth, setCropWidth] = useState<number>(500);
    const [cropHeight, setCropHeight] = useState<number>(500);
    const [zoomPrecision, setZoomPrecision] = useState<number>(0.10);
    const [outputCompression, setOutputCompression] = useState<'original' | 'low' | 'medium' | 'high'>('original');

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
                    originalSizeBytes: file.size,
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
        if (fileArray.length > 10) {
            setAuthPromptVisible(true);
            return;
        }
        if (fileArray.length === 0) return;
        setIsImporting(true);
        setImportTotal(fileArray.length);
        setImportDone(0);
        const created = await Promise.all(
            fileArray.map(async (f) => {
                const res = await createImageItem(f);
                setImportDone((d) => d + 1);
                return res;
            })
        );
        const filtered = created.filter((i): i is ImageItem => i !== null);
        setItems((prev) => [...prev, ...filtered]);
        if (!selectedId && filtered.length > 0) {
            setSelectedId(filtered[0].id);
        }
        setIsImporting(false);
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
            const next = prev.filter((it) => it.id !== id);
            return next;
        });
    }, []);

    const selectedItem = selectedId ? items.find((i) => i.id === selectedId) || null : null;

    if (selectedId && !items.find((i) => i.id === selectedId)) {
        const first = items[0]?.id ?? null;
        if (first !== selectedId) setSelectedId(first);
    }

    return (
        <div className="w-screen h-[calc(100vh-66px)] flex bg-white">
            <Sidebar
                cropWidth={cropWidth}
                cropHeight={cropHeight}
                onChangeCropWidth={setCropWidth}
                onChangeCropHeight={setCropHeight}
                zoomPrecision={zoomPrecision}
                onChangeZoomPrecision={setZoomPrecision}
                outputCompression={outputCompression}
                onChangeOutputCompression={setOutputCompression}
            />
            <div className="flex-1 bg-neutral-50">
                <ImportProgressDialog open={isImporting} importDone={importDone} importTotal={importTotal} />
                <AuthPromptDialog open={authPromptVisible} onOpenChange={setAuthPromptVisible} />
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
                {items.length === 0 ? (
                    <div className="w-full h-full rounded-lg flex gap-2 items-center justify-center">
                        <div onDragOver={onDragOver} onDrop={onDrop} className="flex flex-col border-2 border-dashed p-8 rounded-xl items-center justify-center">

                            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                                <Images className="w-6 h-6 text-neutral-500" />
                            </div>
                            <span className="text-neutral-800 text-lg font-semibold">No images uploaded</span>
                            <span className="text-neutral-400 text-xs">Drag and drop images here or click to upload</span>
                            <Button onClick={openPicker} disabled={isImporting} className="bg-neutral-800 text-white text-xs px-4 py-2 rounded-md mt-4">
                                <Upload className="w-4 h-4 mr-2" />Upload Images
                            </Button>

                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex h-full overflow-hidden">
                            <div className="w-[110px] shrink-0 overflow-auto scrollbar-modern">
                                <div className="flex flex-col gap-2 p-3">
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedId(item.id)}
                                            className={`w-full rounded-lg border overflow-hidden relative ${selectedId === item.id ? 'border-neutral-800 outline-2 outline-offset-2 ring-offset-2 ring-neutral-800' : 'border-neutral-200 hover:border-neutral-300'}`}
                                        >
                                            <img src={item.url} alt={item.filename} className="w-full h-auto block" />
                                            {(() => {
                                                const cap = item.croppedAreaPixels;
                                                const aspect = cropWidth > 0 && cropHeight > 0 ? cropWidth / cropHeight : 1;
                                                let x = 0, y = 0, w = 0, h = 0;
                                                if (cap) {
                                                    x = cap.x; y = cap.y; w = cap.width; h = cap.height;
                                                } else {
                                                    const ow = item.originalWidth, oh = item.originalHeight;
                                                    const containerAspect = ow / oh;
                                                    if (containerAspect > aspect) {
                                                        h = oh; w = h * aspect;
                                                    } else {
                                                        w = ow; h = w / aspect;
                                                    }
                                                    x = (ow - w) / 2; y = (oh - h) / 2;
                                                }
                                                const leftPct = (x / item.originalWidth) * 100;
                                                const topPct = (y / item.originalHeight) * 100;
                                                const widthPct = (w / item.originalWidth) * 100;
                                                const heightPct = (h / item.originalHeight) * 100;
                                                return (
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${leftPct}%`,
                                                            top: `${topPct}%`,
                                                            width: `${widthPct}%`,
                                                            height: `${heightPct}%`,
                                                            border: '2px dashed #ffffff',
                                                            boxShadow: '0 0 0 9999em rgba(0,0,0,0.25)',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                );
                                            })()}
                                            {selectedId === item.id && (
                                                <div className="absolute top-[3px] right-[3px] z-50 size-4 flex items-center justify-center bg-white text-neutral-800 text-xs px-1 rounded-sm">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto min-h-0 scrollbar-modern">
                                {selectedItem && (
                                    <div className="w-full h-full">
                                        <CropperItem
                                            key={selectedItem.id}
                                            item={selectedItem}
                                            targetAspect={cropWidth > 0 && cropHeight > 0 ? cropWidth / cropHeight : 1}
                                        zoomSpeed={zoomPrecision}
                                            onCropChange={onCropChange}
                                            onZoomChange={onZoomChange}
                                            onCropComplete={onCropComplete}
                                            onRemove={onRemove}
                                            cropSize={{ width: cropWidth, height: cropHeight }}
                                            compressionLevel={outputCompression}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
