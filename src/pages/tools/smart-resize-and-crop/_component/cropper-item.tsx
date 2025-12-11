import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, ImageItem, Point } from '../../../../types';
import { Minus, Plus, MoreVertical, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface CropperItemProps {
  item: ImageItem;
  targetAspect: number;
  cropSize?: { width: number; height: number };
  zoomSpeed?: number;
  compressionLevel?: 'original' | 'low' | 'medium' | 'high';
  outputFormat?: 'jpeg' | 'png';
  jpegBgColor?: string;
  onCropChange: (id: string, crop: Point) => void;
  onZoomChange: (id: string, zoom: number) => void;
  onCropComplete: (id: string, croppedArea: Area, croppedAreaPixels: Area) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newBaseName: string) => boolean;
}

export const CropperItem: React.FC<CropperItemProps> = ({
  item,
  targetAspect,
  cropSize,
  zoomSpeed = 0.1,
  compressionLevel = 'original',
  outputFormat = 'jpeg',
  jpegBgColor = '#ffffff',
  onCropChange,
  onZoomChange,
  onCropComplete,
  onRemove,
  onRename
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveCropSize, setEffectiveCropSize] = useState<{ width: number; height: number } | undefined>(undefined);
  const [minZoom, setMinZoom] = useState<number>(0.1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null);

  // Maximum zoom level allowed.
  const MAX_ZOOM = 10;

  const handleCropChange = (location: Point) => {
    onCropChange(item.id, location);
  };

  const handleZoomChange = (zoom: number) => {
    onZoomChange(item.id, zoom);
  };

  const handleZoomIn = () => {
    onZoomChange(item.id, Math.min(MAX_ZOOM, item.zoom + zoomSpeed));
  };

  const handleZoomOut = () => {
    onZoomChange(item.id, Math.max(minZoom, item.zoom - zoomSpeed));
  };

  const handleManualZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) return;
    
    // Convert integer percentage (e.g., 150) to zoom value (1.5)
    let zoomVal = val / 100;
    
    // Clamp
    if (zoomVal < minZoom) zoomVal = minZoom;
    if (zoomVal > MAX_ZOOM) zoomVal = MAX_ZOOM;

    onZoomChange(item.id, zoomVal);
  };

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    onCropComplete(item.id, croppedArea, croppedAreaPixels);
  }, [item.id, onCropComplete]);

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current || !cropSize) { setEffectiveCropSize(undefined); return; }
      const rect = containerRef.current.getBoundingClientRect();
      const Wc = rect.width;
      const Hc = rect.height;
      const r = Math.min(Wc / cropSize.width, Hc / cropSize.height, 1);
      setEffectiveCropSize({ width: Math.floor(cropSize.width * r), height: Math.floor(cropSize.height * r) });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [cropSize]);

  useEffect(() => {
    if (!containerRef.current || !effectiveCropSize) return;
    const rect = containerRef.current.getBoundingClientRect();
    const Wc = rect.width;
    const Hc = rect.height;
    const aspect_c = Wc / Hc;
    const aspect_img = item.originalWidth / item.originalHeight;
    let W_img_0: number, H_img_0: number;
    if (aspect_img > aspect_c) {
      W_img_0 = Wc;
      H_img_0 = Wc / aspect_img;
    } else {
      H_img_0 = Hc;
      W_img_0 = Hc * aspect_img;
    }
    const minZRaw = Math.max(effectiveCropSize.width / W_img_0, effectiveCropSize.height / H_img_0);
    const minZ = Math.max(0.1, minZRaw);
    setMinZoom(minZ);
    if (item.zoom < minZ) onZoomChange(item.id, minZ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCropSize]);

  useEffect(() => {
    setIsImageLoaded(false);
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setIsImageLoaded(true); };
    img.onerror = () => { if (!cancelled) setIsImageLoaded(true); };
    img.src = item.url;
    return () => { cancelled = true; };
  }, [item.url]);

  const qualityForCompression = (level: 'original' | 'low' | 'medium' | 'high'): number => {
    switch (level) {
      case 'low': return 0.4;
      case 'medium': return 0.7;
      case 'high': return 0.9;
      default: return 1.0;
    }
  };

  const computeDefaultCrop = (ow: number, oh: number, aspect: number): Area => {
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

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const cw = cropSize?.width || 0;
        const ch = cropSize?.height || 0;
        if (!cw || !ch) { setEstimatedBytes(null); return; }
        const img = new Image();
        img.src = item.url;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('img-load-failed'));
        });
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setEstimatedBytes(null); return; }
        const cap = item.croppedAreaPixels || computeDefaultCrop(item.originalWidth, item.originalHeight, targetAspect);
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = jpegBgColor;
          ctx.fillRect(0, 0, cw, ch);
        }
        ctx.drawImage(
          img,
          cap.x,
          cap.y,
          cap.width,
          cap.height,
          0,
          0,
          cw,
          ch
        );
        const q = outputFormat === 'jpeg' ? qualityForCompression(compressionLevel) : undefined;
        const mime = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, q as number));
        if (!blob) { setEstimatedBytes(null); return; }
        if (!cancelled) setEstimatedBytes(blob.size);
      } catch {
        if (!cancelled) setEstimatedBytes(null);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [item.url, item.croppedAreaPixels, cropSize?.width, cropSize?.height, compressionLevel, outputFormat, jpegBgColor, targetAspect]);

  // Intelligent Auto-Crop: Calculates Center AND Ideal Zoom
  useEffect(() => {
    if (item.subjectBox && item.aiCropVersion && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const W_c = containerRect.width;
      const H_c = containerRect.height;
      const aspect_c = W_c / H_c;
      
      // 1. Calculate the dimensions of the crop area (the white box) on screen
      // React-easy-crop fits the crop area inside the container based on targetAspect
      let W_crop, H_crop;
      if (aspect_c > targetAspect) {
        // Container is wider than crop area -> Height constrained
        H_crop = H_c;
        W_crop = H_c * targetAspect;
      } else {
        // Container is taller than crop area -> Width constrained
        W_crop = W_c;
        H_crop = W_c / targetAspect;
      }

      // 2. Calculate the dimensions of the image rendered at zoom=1
      // React-easy-crop uses object-fit: contain logic for the media
      const aspect_img = item.originalWidth / item.originalHeight;
      let W_img_0, H_img_0;
      
      if (aspect_img > aspect_c) {
        // Image is wider than container
        W_img_0 = W_c;
        H_img_0 = W_c / aspect_img;
      } else {
        // Image is taller than container
        H_img_0 = H_c;
        W_img_0 = H_c * aspect_img;
      }

      // 3. Calculate Ideal Zoom
      // Subject Height (normalized) from AI
      const h_subj_norm = item.subjectBox.ymax - item.subjectBox.ymin;
      
      // Target Height in pixels. 
      // We set this to 100% (1.0) of the crop box height to minimize margins.
      const target_subj_height_px = H_crop * 1.0; 
      
      // What the subject height would be at zoom 1
      const subj_height_px_0 = h_subj_norm * H_img_0;
      
      // Required Zoom to scale subject to target height
      let requiredZoom = target_subj_height_px / subj_height_px_0;

      // 3.1. Apply "Tight Fit" Boost
      // We multiply by 1.05 (5% extra zoom) to aggressively remove any "safety margin" 
      // the AI might have left around the subject.
      requiredZoom = requiredZoom * 1.05;
      
      // Clamp Zoom (1 to MAX_ZOOM)
      requiredZoom = Math.max(1, Math.min(MAX_ZOOM, requiredZoom));

      // 4. Calculate Center Offset
      // We need to shift the image so the subject's center aligns with the crop area's center
      const subj_center_x_norm = (item.subjectBox.xmin + item.subjectBox.xmax) / 2;
      const subj_center_y_norm = (item.subjectBox.ymin + item.subjectBox.ymax) / 2;
      
      // Dimensions at new zoom
      const W_img_z = W_img_0 * requiredZoom;
      const H_img_z = H_img_0 * requiredZoom;

      // The shift required: Distance from image center (0.5) to subject center, scaled by pixel size
      const newCropX = (0.5 - subj_center_x_norm) * W_img_z;
      const newCropY = (0.5 - subj_center_y_norm) * H_img_z;

      // Apply changes
      onZoomChange(item.id, requiredZoom);
      onCropChange(item.id, { x: newCropX, y: newCropY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.aiCropVersion]); // Only run when AI detection version updates

  return (
    <div 
      className="flex flex-col bg-white overflow-hidden border-l group w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      <div className="flex-1 flex overflow-hidden">
        <div className="relative flex-1 w-full min-h-0" ref={containerRef}>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin"></div>
                <span className="text-[11px] text-neutral-500">Loading image...</span>
              </div>
            </div>
          )}
          {isImageLoaded && (
            <Cropper
              image={item.url}
              crop={item.crop}
              zoom={item.zoom}
              aspect={targetAspect}
              cropSize={effectiveCropSize}
              restrictPosition
              minZoom={minZoom}
              onCropChange={handleCropChange}
              onZoomChange={handleZoomChange}
              onCropComplete={handleCropComplete}
              showGrid={true}
              zoomSpeed={zoomSpeed}
              maxZoom={MAX_ZOOM}
              classes={{
                containerClassName: "", 
                mediaClassName: "",
              }}
              style={{
                 containerStyle: {
                     backgroundColor: 'white',
                     backgroundImage: "linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%), linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%)",
                     backgroundPosition: '0 0, 10px 10px',
                     backgroundSize: '20px 20px'
                 },
                 cropAreaStyle: {
                     border: "2px solid rgba(255, 255, 255, 0.9)",
                     color: "rgba(255, 255, 255, 0.5)",
                     boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.6)" 
                 }
              }}
            />
          )}
          <div className="absolute bottom-3 right-3 z-50 flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
              onClick={handleZoomOut}
              disabled={item.zoom <= minZoom}
              className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="relative w-12">
              <input 
                type="number"
                min={Math.round(minZoom * 100)}
                max={MAX_ZOOM * 100}
                step="1"
                value={Math.round(item.zoom * 100)}
                onChange={handleManualZoomChange}
                className="w-full text-center text-[10px] font-mono text-gray-600 bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none rounded px-1 transition-all"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 pointer-events-none pr-1">%</span>
            </div>
            <button 
              onClick={handleZoomIn}
              disabled={item.zoom >= MAX_ZOOM}
              className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-none w-[240px] bg-slate-50 p-3 border-l border-gray-100 z-20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              {!isEditingName ? (
                <span
                  className="text-xs font-medium text-gray-700 truncate cursor-text"
                  title={item.filename.replace(/\.[^.]+$/, "")}
                  onDoubleClick={() => {
                    const base = item.filename.replace(/\.[^.]+$/, "");
                    setNameInput(base);
                    setIsEditingName(true);
                    setNameError("");
                  }}
                >
                  {item.filename.replace(/\.[^.]+$/, "")}
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={() => {
                        const ok = onRename(item.id, nameInput.trim());
                        if (ok) {
                          setIsEditingName(false);
                          setNameError("");
                        } else {
                          setNameError("Name already exists or is invalid");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const ok = onRename(item.id, nameInput.trim());
                          if (ok) {
                            setIsEditingName(false);
                            setNameError("");
                          } else {
                            setNameError("Name already exists or is invalid");
                          }
                        }
                        if (e.key === "Escape") {
                          setIsEditingName(false);
                          setNameError("");
                        }
                      }}
                      className="h-6 text-xs flex-1"
                    />
                    <button
                      onClick={() => {
                        const ok = onRename(item.id, nameInput.trim());
                        if (ok) {
                          setIsEditingName(false);
                          setNameError("");
                        } else {
                          setNameError("Name already exists or is invalid");
                        }
                      }}
                      className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-gray-700"
                      title="Confirm"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {nameError && (
                    <span className="text-[10px] text-red-500">{nameError}</span>
                  )}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-md transition-colors" title="Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => { const base = item.filename.replace(/\.[^.]+$/, ""); setNameInput(base); setIsEditingName(true); setNameError(""); }}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemove(item.id)} className="text-red-600">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500">Original</span>
            <span className="text-[11px]">Resolution: {item.originalWidth} x {item.originalHeight}</span>
            <span className="text-[11px]">Size: {item.originalSizeBytes ? (item.originalSizeBytes >= 1048576 ? `${(item.originalSizeBytes/1048576).toFixed(2).replace('.', ',')} Mb` : `${(item.originalSizeBytes/1024).toFixed(2).replace('.', ',')} Kb`) : "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500">Output</span>
            <span className="text-[11px]">{cropSize ? `${cropSize.width} x ${cropSize.height}` : "-"}</span>
            <span className="text-[11px]">
              {(() => {
                const ob = item.originalSizeBytes || 0;
                const est = estimatedBytes || 0;
                if (!est) return "-";
                const txt = est >= 1048576 ? `${(est/1048576).toFixed(2).replace('.', ',')} Mb` : `${(est/1024).toFixed(2).replace('.', ',')} Kb`;
                const red = ob ? Math.max(0, 100 * (1 - est / ob)) : 0;
                const redTxt = red.toFixed(2).replace('.', ',');
                return ob ? `${txt} ( - ${redTxt} % )` : txt;
              })()}
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
};
