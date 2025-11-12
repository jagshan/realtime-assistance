interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const getCroppedImg = (imageSrc: string, crop: PixelCrop): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            canvas.width = crop.width;
            canvas.height = crop.height;

            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                crop.width,
                crop.height
            );

            // Get the data URL of the cropped image
            const croppedImageUrl = canvas.toDataURL('image/jpeg');
            resolve(croppedImageUrl);
        };
        image.onerror = (error) => reject(error);
    });
};
