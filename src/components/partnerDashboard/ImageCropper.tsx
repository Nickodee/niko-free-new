import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 16/9, use 1 for square
  cropShape?: 'rect' | 'round'; // Default 'rect', use 'round' for circular
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  filename = 'cropped-image.jpg'
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const file = new File([blob], filename, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
};

export default function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  aspectRatio = 16 / 9,
  cropShape = 'rect'
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = useCallback(async () => {
    try {
      if (!croppedAreaPixels) return;
      const filename = cropShape === 'round' ? 'profile-picture.jpg' : 'event-poster.jpg';
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation, filename);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [croppedAreaPixels, rotation, image, onCropComplete, cropShape]);

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-white font-semibold text-lg">Crop & Adjust Image</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          cropShape={cropShape}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          objectFit="contain"
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-4 py-4 space-y-4 border-t border-gray-700">
        {/* Zoom Control */}
        <div className="flex items-center gap-3">
          <ZoomOut className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#27aae2]"
          />
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </div>

        {/* Rotation Control */}
        <div className="flex items-center gap-3">
          <RotateCw className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            value={rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#27aae2]"
          />
          <span className="text-gray-400 text-sm w-12">{rotation}°</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
