'use client';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { Camera, ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  onRemove: () => void;
}


const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove }) => {
  const webcamRef = useRef<Webcam>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);


    useEffect(() => {
  if (typeof value === 'string') {
    setPreviewUrl(value);
  } else if (value instanceof File) {
    setPreviewUrl(URL.createObjectURL(value));
  } else {
    setPreviewUrl(null);
  }
}, [value]);


  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          setPreviewUrl(URL.createObjectURL(file));
          onChange(file);
          setShowCamera(false);
        });
    }
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    onChange(file); // ✅ ya no necesitas setPreviewUrl aquí
  }
};


  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove();
  };




  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button onClick={handleRemove} variant="destructive" size="sm">
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {!previewUrl && showCamera && (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={300}
          />
          <Button onClick={capture}>Tomar Foto</Button>
        </div>
      )}

      {!previewUrl && !showCamera && (
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />

          <Button variant="secondary" onClick={() => document.getElementById('fileInput')?.click()}   type="button" > 
            <ImagePlus className="h-4 w-4 mr-2" />
            Subir desde galería
          </Button>
          <Button variant="outline" onClick={() => setShowCamera(true)}   type="button" >
            <Camera className="h-4 w-4 mr-2" />
            Tomar con cámara
          </Button>



        </div>



      )}
    </div>
  );
};

export default ImageUpload;
