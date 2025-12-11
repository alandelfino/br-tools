import { Input } from "@/components/ui/input";
import { Download, ImageUpscale, Plus, Scissors, Sparkles, Trash, Trash2, User } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Sidebar({
    cropWidth,
    cropHeight,
    onChangeCropWidth,
    onChangeCropHeight,
    zoomPrecision,
    onChangeZoomPrecision,
    outputCompression,
    onChangeOutputCompression,
}: {
    cropWidth: number;
    cropHeight: number;
    onChangeCropWidth: (value: number) => void;
    onChangeCropHeight: (value: number) => void;
    zoomPrecision: number;
    onChangeZoomPrecision: (value: number) => void;
    outputCompression: 'original' | 'low' | 'medium' | 'high';
    onChangeOutputCompression: (value: 'original' | 'low' | 'medium' | 'high') => void;
}) {
    return (
        <div className="w-[270px] border-r flex flex-col">

            <div className="flex items-center gap-3 p-4">
                <div className="rounded-xl flex items-center justify-center">
                    <ImageUpscale className="size-8 text-slate-300" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Smart Resize & Crop</span>
                    <span className="text-xs text-slate-500">Ease and Fast</span>
                </div>
            </div>

            <div className="p-4 gap-4 flex flex-col flex-1">

                <div>
                    <Label className="uppercase text-xs">Settings</Label>
                </div>

                <div className="flex justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs pl-1">Width</span>
                        <div className="flex relative">
                            <Input className="bg-neutral-50 border px-2 rounded-md w-full h-7 text-xs" step={1} placeholder="0" type="number" value={Number.isFinite(cropWidth) ? cropWidth : 0} onChange={(e) => onChangeCropWidth(parseInt(e.target.value || '0', 10))} />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">px</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs pl-1">Height</span>
                        <div className="flex relative">
                            <Input className="bg-neutral-50 border px-2 rounded-md w-full h-7 text-xs" step={1} placeholder="0" type="number" value={Number.isFinite(cropHeight) ? cropHeight : 0} onChange={(e) => onChangeCropHeight(parseInt(e.target.value || '0', 10))} />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">px</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs pl-1">Zoom Precision</span>
                        <Input className="bg-neutral-50 w-26 h-7 text-xs rounded-md border px-2" placeholder="0" type="number" step={0.01} min={0.01} max={1} value={Number.isFinite(zoomPrecision) ? zoomPrecision : 0.06} onChange={(e) => onChangeZoomPrecision(parseFloat(e.target.value || '0.1'))} />
                        <span className="text-muted-foreground/50 text-[0.6rem] pl-1">Lower value = finer control</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs pl-1">Output Compression</span>
                        <Select value={outputCompression} onValueChange={(v) => onChangeOutputCompression(v as 'original' | 'low' | 'medium' | 'high')}>
                            <SelectTrigger className="bg-neutral-50 h-7! text-xs rounded-md border px-2 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-50 text-xs rounded-md border px-1 w-full">
                                <SelectItem value="original" className="text-xs">Original</SelectItem>
                                <SelectItem value="low" className="text-xs">Low Compression</SelectItem>
                                <SelectItem value="medium" className="text-xs">Medium Compression</SelectItem>
                                <SelectItem value="high" className="text-xs">High Compression</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground/50 text-[0.6rem] pl-1">Reduces file size without visible loss</span>
                    </div>
                </div>

                <div className="h-px bg-neutral-100 w-full my-4"></div>

                <div className="flex gap-4">
                    <Button size={"lg"} className="bg-linear-to-r from-teal-200 to-yellow-200 w-full">
                        <Sparkles className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">Auto Smart Ajust</span>
                        <span className="text-[0.7rem] text-neutral-500 bg-white border rounded px-1 ml-2">Soon</span>
                    </Button>
                </div>

                <div className="flex gap-4">
                    <Button size={"lg"} className="w-full">
                        <Download className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Crop & Download All</span>
                    </Button>
                </div>

                <div className="flex gap-4">
                    <Button variant={"ghost"} size={"lg"} className="w-full text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Clear All</span>
                    </Button>
                </div>

            </div>

            

        </div>
    )
}
