import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';

interface ImageCropModalProps {
    image: string;
    aspectRatio: number;
    onClose: () => void;
    onSave: (blob: Blob) => void;
    isUploading: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ 
    image, aspectRatio, onClose, onSave, isUploading 
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_area: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const generateCroppedImage = async () => {
        if (!croppedAreaPixels) return;

        const img = new Image();
        img.src = image;
        await new Promise((res) => (img.onload = res));

        const canvas = document.createElement('canvas');
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext('2d');

        ctx?.drawImage(
            img,
            croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
            0, 0, croppedAreaPixels.width, croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, 'image/webp', 0.9);
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="relative bg-[#0a0a0a] w-full max-w-2xl border border-white/10 rounded-[40px] flex flex-col h-[80vh] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center text-white">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Обрезать обложку</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
                </div>

                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-8 bg-[#0a0a0a] flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Отмена</button>
                    <button 
                        onClick={generateCroppedImage} 
                        disabled={isUploading} 
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50"
                    >
                        {isUploading ? 'Загрузка...' : 'Применить и сохранить'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};