"use client";
import React, { useState, useCallback, useRef, ChangeEvent } from "react";
import Image from "next/image";

interface AvatarUploaderProps {
  initialImage?: string;
  onImageChange: (file: File | null) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  initialImage,
  onImageChange,
}) => {
  const normalizedInitialImage = initialImage || null;
  const [preview, setPreview] = useState<string | null>(normalizedInitialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Por favor, sube solo archivos de imagen");
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          alert("La imagen no debe exceder los 2MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setPreview(reader.result as string);
          }
        };
        reader.readAsDataURL(file);

        onImageChange(file);
      } else {
        onImageChange(null);
      }
    },
    [onImageChange]
  );

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        {preview ? (
          <Image
            src={preview}
            alt="Preview de avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={triggerFileInput}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Cambiar foto
        </button>

        {preview && preview !== normalizedInitialImage && (
          <button
            type="button"
            onClick={() => {
              setPreview(normalizedInitialImage);
              onImageChange(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Eliminar
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Formatos soportados: JPG, PNG, WEBP (Máx. 2MB)
      </p>
    </div>
  );
};
