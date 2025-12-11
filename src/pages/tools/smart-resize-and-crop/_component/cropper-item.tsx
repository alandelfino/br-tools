import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, ImageItem, Point } from '../../../../types';
import { Minus, Plus, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CropperItemProps {
  item: ImageItem;
  targetAspect: number;
  cropSize?: { width: number; height: number };
  zoomSpeed?: number;
  compressionLevel?: 'original' | 'low' | 'medium' | 'high';
  onCropChange: (id: string, crop: Point) => void;
  onZoomChange: (id: string, zoom: number) => void;
  onCropComplete: (id: string, croppedArea: Area, croppedAreaPixels: Area) => void;
  onRemove: (id: string) => void;
}

export const CropperItem: React.FC<CropperItemProps> = ({
  item,
  targetAspect,
  cropSize,
  zoomSpeed = 0.1,
  compressionLevel = 'original',
  onCropChange,
  onZoomChange,
  onCropComplete,
  onRemove
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveCropSize, setEffectiveCropSize] = useState<{ width: number; height: number } | undefined>(undefined);
  const [minZoom, setMinZoom] = useState<number>(1);

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
    onZoomChange(item.id, Math.max(1, item.zoom - zoomSpeed));
  };

  const handleManualZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) return;
    
    // Convert integer percentage (e.g., 150) to zoom value (1.5)
    let zoomVal = val / 100;
    
    // Clamp
    if (zoomVal < 1) zoomVal = 1;
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
    const minZ = Math.max(effectiveCropSize.width / W_img_0, effectiveCropSize.height / H_img_0, 1);
    setMinZoom(minZ);
    if (item.zoom < minZ) onZoomChange(item.id, minZ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCropSize]);

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
      {/* Header Info - Light Theme */}
      <div className="flex-none bg-white p-3 flex justify-between items-center border-b border-gray-100 z-20">
         <span className="text-xs font-medium text-gray-700 truncate" title={item.filename}>{item.filename}</span>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <button className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-md transition-colors" title="Opções">
               <MoreVertical className="w-4 h-4" />
             </button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-32">
             <DropdownMenuItem onClick={() => onRemove(item.id)} className="text-red-600">Remover</DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
      </div>

      {/* Cropper Container - Takes remaining space */}
      <div className="relative flex-1 w-full min-h-0" ref={containerRef}>
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
                 backgroundImage: `
                    linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%),
                    linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%)
                 `,
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
      </div>
      
      {/* Footer - Light Theme with Zoom Controls */}
      <div className="flex-none bg-white p-3 border-t border-gray-100 z-20 flex justify-between items-center gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500">Original</span>
            <span className="text-[11px]">Resolução: {item.originalWidth} x {item.originalHeight}</span>
            <span className="text-[11px]">Tamanho: {item.originalSizeBytes ? (item.originalSizeBytes >= 1048576 ? `${(item.originalSizeBytes/1048576).toFixed(2).replace('.', ',')} Mb` : `${(item.originalSizeBytes/1024).toFixed(2).replace('.', ',')} Kb`) : "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500">Saída</span>
            <span className="text-[11px]">{cropSize ? `${cropSize.width} x ${cropSize.height}` : "-"}</span>
            <span className="text-[11px]">
              {(() => {
                const ow = item.originalWidth;
                const oh = item.originalHeight;
                const ob = item.originalSizeBytes || 0;
                const cw = cropSize?.width || 0;
                const ch = cropSize?.height || 0;
                if (!ob || !ow || !oh || !cw || !ch) return "-";
                const ratio = (cw * ch) / (ow * oh);
                const factor = compressionLevel === 'original' ? 1 : compressionLevel === 'low' ? 0.8 : compressionLevel === 'medium' ? 0.6 : 0.4;
                const est = Math.max(1, Math.round(ob * ratio * factor));
                const txt = est >= 1048576 ? `${(est/1048576).toFixed(2).replace('.', ',')} Mb` : `${(est/1024).toFixed(2).replace('.', ',')} Kb`;
                const red = Math.max(0, 100 * (1 - est / ob));
                const redTxt = red.toFixed(2).replace('.', ',');
                return `${txt} ( - ${redTxt} % )`;
              })()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button 
            onClick={handleZoomOut}
            disabled={item.zoom <= 1}
            className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <div className="relative w-12 group/input">
             <input 
                type="number"
                min="100"
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
    </div>
  );
};
