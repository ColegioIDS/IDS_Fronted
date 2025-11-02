// src/lib/cloudinary.ts
/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo de imagen a subir
 * @param folder - Carpeta en Cloudinary (default: 'ids_usuarios')
 * @returns Objeto con url y publicId
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'ids_usuarios'
): Promise<{ url: string; publicId: string }> {
  // Validar variables de entorno
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Variables de entorno Cloudinary no configuradas. ' +
      'Asegúrate de tener NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
    );
  }

  // Validar archivo
  if (!file) {
    throw new Error('No se proporcionó archivo');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('La imagen no debe exceder 5MB');
  }

  // Preparar FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Error al subir imagen a Cloudinary');
    }

    const data = await res.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al subir imagen a Cloudinary');
  }
}



