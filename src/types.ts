export interface CropConfig {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Area {
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface BoundingBox {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
}

export interface ImageItem {
    id: string;
    url: string;
    originalWidth: number;
    originalHeight: number;
    originalSizeBytes?: number;
    filename: string;
    // Store crop state per image
    crop: Point;
    zoom: number;
    croppedAreaPixels: Area | null;
    // AI Detection Data
    subjectBox?: BoundingBox;
    aiCropVersion?: number; // Used to trigger recalculation in UI
}
