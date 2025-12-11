import { Check, Images, Plus, Upload } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { CropperItem } from "./cropper-item";
import type { ImageItem, Area, Point } from "@/types";
import { FieldSeparator } from "@/components/ui/field";
import { ImportProgressDialog } from "./import-progress-dialog";
import { AuthPromptDialog } from "./auth-prompt-dialog";
import JSZip from "jszip";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
    const [zoomPrecision, setZoomPrecision] = useState<number>(0.06);
    const [outputCompression, setOutputCompression] = useState<'original' | 'low' | 'medium' | 'high'>('original');
    const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
    const [jpegBgColor, setJpegBgColor] = useState<string>('#ffffff');
    const [isExporting, setIsExporting] = useState(false);
    const [exportTotal, setExportTotal] = useState(0);
    const [exportDone, setExportDone] = useState(0);

    const createImageItem = (file: File): Promise<ImageItem | null> => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = async () => {
                let thumbUrl: string | undefined;
                let tw: number | undefined;
                let th: number | undefined;
                try {
                    const maxW = 100;
                    const maxH = 100;
                    const ratioW = Math.min(maxW, img.naturalWidth);
                    const ratioH = Math.round(img.naturalHeight * (ratioW / img.naturalWidth));
                    tw = ratioW;
                    th = ratioH;
                    if (th > maxH) {
                        th = maxH;
                        tw = Math.round(img.naturalWidth * (th / img.naturalHeight));
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = tw!;
                    canvas.height = th!;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, tw!, th!);
                        let blob: Blob | null = await new Promise((resolveBlob) => canvas.toBlob((b) => resolveBlob(b), 'image/webp'));
                        if (!blob) {
                            blob = await new Promise((resolveBlob) => canvas.toBlob((b) => resolveBlob(b), 'image/png'));
                        }
                        if (blob) {
                            thumbUrl = URL.createObjectURL(blob);
                        }
                    }
                } catch {}
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
                    thumbUrl,
                    thumbWidth: tw,
                    thumbHeight: th,
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
        const el = fileInputRef.current as HTMLInputElement | null;
        if (!el) return;
        el.click();
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('open') === 'upload') {
            openPicker();
            const url = new URL(window.location.href);
            url.searchParams.delete('open');
            window.history.replaceState({}, '', url.toString());
        }
    }, [openPicker]);



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
            if (target) {
                URL.revokeObjectURL(target.url);
                if (target.thumbUrl) URL.revokeObjectURL(target.thumbUrl);
            }
            const next = prev.filter((it) => it.id !== id);
            return next;
        });
    }, []);

    const onClearAll = useCallback(() => {
        setItems((prev) => {
            prev.forEach((i) => {
                URL.revokeObjectURL(i.url);
                if (i.thumbUrl) URL.revokeObjectURL(i.thumbUrl);
            });
            return [];
        });
        setSelectedId(null);
    }, []);

    const onRename = useCallback((id: string, newBase: string) => {
        const base = newBase.trim();
        if (!base) return false;
        const exists = items.some((it) => it.id !== id && it.filename.replace(/\.[^.]+$/, '') === base);
        if (exists) return false;
        setItems((prev) => prev.map((it) => {
            if (it.id !== id) return it;
            const ext = (it.filename.match(/(\.[^.]+)$/)?.[1]) || '';
            return { ...it, filename: `${base}${ext}` };
        }));
        return true;
    }, [items]);

    const hasDuplicateBaseNames = useMemo(() => {
        const bases = items.map((it) => it.filename.replace(/\.[^.]+$/, '').toLowerCase());
        const seen = new Set<string>();
        for (const b of bases) {
            if (seen.has(b)) return true;
            seen.add(b);
        }
        return false;
    }, [items]);

    const computeDefaultCrop = (it: ImageItem): Area => {
        const ow = it.originalWidth;
        const oh = it.originalHeight;
        const aspect = cropWidth > 0 && cropHeight > 0 ? cropWidth / cropHeight : 1;
        let w = 0, h = 0;
        if (ow / oh > aspect) {
            h = oh; w = h * aspect;
        } else {
            w = ow; h = w / aspect;
        }
        const x = (ow - w) / 2;
        const y = (oh - h) / 2;
        return { x, y, width: w, height: h } as Area;
    };

    const qualityForCompression = (level: 'original' | 'low' | 'medium' | 'high'): number => {
        switch (level) {
            case 'low': return 0.4;
            case 'medium': return 0.7;
            case 'high': return 0.9;
            default: return 1.0;
        }
    };

    const processAllAndDownload = useCallback(async () => {
        if (items.length === 0) return;
        const bases = items.map((it) => it.filename.replace(/\.[^.]+$/, '').toLowerCase());
        const set = new Set<string>();
        for (const b of bases) { if (set.has(b)) return; set.add(b); }
        setIsExporting(true);
        setExportTotal(items.length);
        setExportDone(0);
        const zip = new JSZip();
        for (const it of items) {
            try {
                const img = new Image();
                img.src = it.url;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('failed'));
                });
                const canvas = document.createElement('canvas');
                const targetW = Math.max(1, cropWidth || 1);
                const targetH = Math.max(1, cropHeight || 1);
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('noctx');
                const cap = it.croppedAreaPixels || computeDefaultCrop(it);
                if (outputFormat === 'jpeg') {
                    ctx.fillStyle = jpegBgColor;
                    ctx.fillRect(0, 0, targetW, targetH);
                }
                ctx.drawImage(
                    img,
                    cap.x,
                    cap.y,
                    cap.width,
                    cap.height,
                    0,
                    0,
                    targetW,
                    targetH
                );
                const q = outputFormat === 'jpeg' ? qualityForCompression(outputCompression) : undefined;
                const mime = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
                const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mime, q as number));
                const base = it.filename.replace(/\.[^.]+$/, '');
                const ext = outputFormat === 'png' ? 'png' : 'jpg';
                const fname = `${base}_cropped.${ext}`;
                zip.file(fname, blob);
            } catch {}
            setExportDone((d) => d + 1);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'images.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setIsExporting(false);
    }, [items, cropWidth, cropHeight, outputCompression, outputFormat, jpegBgColor]);

    const selectedItem = selectedId ? items.find((i) => i.id === selectedId) || null : null;

    if (selectedId && !items.find((i) => i.id === selectedId)) {
        const first = items[0]?.id ?? null;
        if (first !== selectedId) setSelectedId(first);
    }

    return (
        <div className="w-screen h-[calc(100vh-66px)] flex bg-white overflow-hidden">
            <Sidebar
                cropWidth={cropWidth}
                cropHeight={cropHeight}
                onChangeCropWidth={setCropWidth}
                onChangeCropHeight={setCropHeight}
                zoomPrecision={zoomPrecision}
                onChangeZoomPrecision={setZoomPrecision}
                outputCompression={outputCompression}
                onChangeOutputCompression={setOutputCompression}
                onClearAll={onClearAll}
                hasItems={items.length > 0}
                onDownloadAll={processAllAndDownload}
                downloadDisabled={hasDuplicateBaseNames || isExporting}
                outputFormat={outputFormat}
                onChangeOutputFormat={setOutputFormat}
                jpegBgColor={jpegBgColor}
                onChangeJpegBgColor={setJpegBgColor}
            />
            <div className="flex-1 bg-neutral-50 h-full min-w-0">
                <ImportProgressDialog open={isImporting} importDone={importDone} importTotal={importTotal} />
                <AuthPromptDialog open={authPromptVisible} onOpenChange={setAuthPromptVisible} />
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
                {items.length === 0 ? (
                    <div className="w-full h-full rounded-lg flex gap-2 items-center justify-center relative">
                        <div className="absolute -inset-4 bg-linear-to-r from-teal-200 to-yellow-200 blur-3xl opacity-40 rounded-3xl w-[300px] h-[300px] m-auto"></div>
                        <div onDragOver={onDragOver} onDrop={onDrop} className="flex flex-col border-2 border-dashed p-8 rounded-xl items-center justify-center relative bg-white">
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
                    <div className="flex flex-col gap-2 h-full min-h-0">
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
                                        outputFormat={outputFormat}
                                        jpegBgColor={jpegBgColor}
                                        onRename={onRename}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="h-[120px] shrink-0 w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar-modern">
                            <div className="inline-flex flex-nowrap gap-2 p-1 mb-2 w-fit">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedId(item.id)}
                                        className={`w-[100px] h-[100px] shrink-0 rounded-lg border overflow-hidden relative ${selectedId === item.id ? 'border-neutral-800 outline-2 outline-offset-2 ring-offset-2 ring-neutral-800' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <img src={item.thumbUrl || item.url} alt={item.filename} className="w-full h-full object-contain block" />
                                        {(() => {
                                            const CW = 100, CH = 100;
                                            const ow = item.originalWidth, oh = item.originalHeight;
                                            const cap = item.croppedAreaPixels || (() => {
                                                const aspect = cropWidth > 0 && cropHeight > 0 ? cropWidth / cropHeight : 1;
                                                let w = 0, h = 0;
                                                if (ow / oh > aspect) { h = oh; w = h * aspect; } else { w = ow; h = w / aspect; }
                                                const x = (ow - w) / 2; const y = (oh - h) / 2;
                                                return { x, y, width: w, height: h } as Area;
                                            })();
                                            const aspectImg = ow / oh;
                                            let dispW = CW, dispH = CH, offsetX = 0, offsetY = 0;
                                            if (aspectImg > (CW/CH)) {
                                                dispW = CW; dispH = Math.round(CW / aspectImg); offsetY = Math.round((CH - dispH) / 2);
                                            } else {
                                                dispH = CH; dispW = Math.round(CH * aspectImg); offsetX = Math.round((CW - dispW) / 2);
                                            }
                                            const scaleX = dispW / ow; const scaleY = dispH / oh;
                                            const leftPx = offsetX + Math.round(cap.x * scaleX);
                                            const topPx = offsetY + Math.round(cap.y * scaleY);
                                            const widthPx = Math.round(cap.width * scaleX);
                                            const heightPx = Math.round(cap.height * scaleY);

                                            const clamp = (v: number) => Math.max(0, Math.min(v, 100));
                                            const l = clamp(leftPx);
                                            const t = clamp(topPx);
                                            const w = clamp(widthPx);
                                            const h = clamp(heightPx);
                                            const r = clamp(l + w);
                                            const b = clamp(t + h);

                                            return (
                                                <>
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${l}px`,
                                                            top: `${t}px`,
                                                            width: `${w}px`,
                                                            height: `${h}px`,
                                                            border: '2px dashed #ffffff',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{ position: 'absolute', left: 0, top: 0, width: '100px', height: `${t}px`, background: 'rgba(0,0,0,0.25)' }}
                                                    />
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{ position: 'absolute', left: 0, top: `${t}px`, width: `${l}px`, height: `${h}px`, background: 'rgba(0,0,0,0.25)' }}
                                                    />
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{ position: 'absolute', left: `${r}px`, top: `${t}px`, width: `${100 - r}px`, height: `${h}px`, background: 'rgba(0,0,0,0.25)' }}
                                                    />
                                                    <span
                                                        className="pointer-events-none"
                                                        style={{ position: 'absolute', left: 0, top: `${b}px`, width: '100px', height: `${100 - b}px`, background: 'rgba(0,0,0,0.25)' }}
                                                    />
                                                </>
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
                    </div>
                )}

                <Dialog open={isExporting}>
                    <DialogContent className="w-[420px]" showCloseButton={false}>
                        <DialogTitle>Processando imagens</DialogTitle>
                        <DialogDescription>Cortando, redimensionando e gerando ZIP</DialogDescription>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-neutral-600">Progresso</span>
                            <span className="text-xs text-neutral-600">{exportDone}/{exportTotal}</span>
                        </div>
                        <div className="w-full h-2 rounded bg-neutral-100 overflow-hidden">
                            <div
                                className="h-2 bg-neutral-800"
                                style={{ width: `${exportTotal ? Math.round((exportDone / exportTotal) * 100) : 0}%` }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
