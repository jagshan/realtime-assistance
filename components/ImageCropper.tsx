import React, { useState, useRef, useEffect } from 'react';
import { getCroppedImg } from '../utils/cropImage';

interface ImageCropperProps {
    imageSrc: string;
    onCrop: (croppedImage: string) => void;
    onCancel: () => void;
}

const CROP_BOX_SIZE = 256; // px

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging.current || !containerRef.current) return;
            e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const dx = clientX - dragStart.current.x;
            const dy = clientY - dragStart.current.y;

            setCropPos(prev => {
                const rect = containerRef.current!.getBoundingClientRect();
                const newX = Math.max(0, Math.min(rect.width - CROP_BOX_SIZE, prev.x + dx));
                const newY = Math.max(0, Math.min(rect.height - CROP_BOX_SIZE, prev.y + dy));
                return { x: newX, y: newY };
            });

            dragStart.current = { x: clientX, y: clientY };
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStart.current = { x: clientX, y: clientY };
    };
    
    const handleCrop = async () => {
        if (imageRef.current && containerRef.current) {
            const image = imageRef.current;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Calculate scale factor
            const scaleX = image.naturalWidth / containerRect.width;
            const scaleY = image.naturalHeight / containerRect.height;
            
            const crop = {
                x: cropPos.x * scaleX,
                y: cropPos.y * scaleY,
                width: CROP_BOX_SIZE * scaleX,
                height: CROP_BOX_SIZE * scaleY
            };
            const croppedImageUrl = await getCroppedImg(imageSrc, crop);
            onCrop(croppedImageUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-xl max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4 text-center">Crop Image</h3>
                <div 
                    ref={containerRef}
                    className="relative w-full cursor-move"
                    style={{ maxHeight: '60vh', overflow: 'hidden' }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    <img ref={imageRef} src={imageSrc} alt="To crop" className="max-w-full max-h-full block" />
                    <div className="absolute inset-0 bg-black bg-opacity-50" style={{ pointerEvents: 'none' }}></div>
                    <div
                        className="absolute border-2 border-dashed border-white"
                        style={{
                            top: cropPos.y,
                            left: cropPos.x,
                            width: CROP_BOX_SIZE,
                            height: CROP_BOX_SIZE,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            pointerEvents: 'none',
                        }}
                    ></div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                    <button onClick={handleCrop} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md">Crop</button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
