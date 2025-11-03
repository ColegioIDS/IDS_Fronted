// src/components/form/UploadImage/image-upload-simple.tsx
/**
 * Componente simplificado para subir imágenes
 * Devuelve solo el File, sin gestionar FormData
 * El padre es responsable de subir a Cloudinary
 */
'use client';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { Camera, ImagePlus } from 'lucide-react';

interface ImageUploadSimpleProps {
  value: File | { url: string; publicId: string; kind: string; description: string } | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

const ImageUploadSimple: React.FC<ImageUploadSimpleProps> = ({ value, onChange, onRemove }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (value && typeof value === 'object' && 'url' in value) {
      // ✅ Si es un objeto con URL (de Cloudinary)
      setPreviewUrl(value.url);
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
          onChange(file);
          setShowCamera(false);
        });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <>
          <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <Button onClick={handleRemove} variant="destructive" size="sm">
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()} 
              type="button"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Cambiar foto
            </Button>
          </div>
        </>
      )}

      {!previewUrl && showCamera && (
        <div className="space-y-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={300}
          />
          <div className="flex gap-2">
            <Button onClick={capture} type="button">
              Tomar Foto
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCamera(false)} 
              type="button"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!previewUrl && !showCamera && (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />

          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            type="button" 
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Subir desde galería
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCamera(true)}
            type="button" 
          >
            <Camera className="h-4 w-4 mr-2" />
            Tomar con cámara
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSimple;
