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
  console.log('🔄 Iniciando upload a Cloudinary...');
  
  // Validar variables de entorno
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log('🔍 Variables de entorno:', {
    cloudName: cloudName ? '✅ Configurado' : '❌ Falta',
    uploadPreset: uploadPreset ? '✅ Configurado' : '❌ Falta',
  });

  if (!cloudName || !uploadPreset) {
    const errorMsg = 'Variables de entorno Cloudinary no configuradas. ' +
      'Asegúrate de tener NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // Validar archivo
  if (!file) {
    throw new Error('No se proporcionó archivo');
  }

  console.log('📄 Archivo:', {
    nombre: file.name,
    tipo: file.type,
    tamaño: (file.size / 1024 / 1024).toFixed(2) + ' MB',
  });

  if (!file.type.startsWith('image/')) {
    const errorMsg = `El archivo debe ser una imagen. Tipo recibido: ${file.type}`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const errorMsg = `La imagen no debe exceder 5MB. Tamaño recibido: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // Preparar FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    console.log('📤 Enviando a Cloudinary...');
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('📊 Respuesta HTTP:', res.status, res.statusText);

    if (!res.ok) {
      const error = await res.json();
      const errorMsg = error.error?.message || `Error HTTP ${res.status}`;
      console.error('❌ Error de Cloudinary:', error);
      throw new Error(`Error al subir a Cloudinary: ${errorMsg}`);
    }

    const data = await res.json();

    console.log('✅ Upload exitoso');
    console.log('✅ Respuesta de Cloudinary:', {
      url: data.secure_url,
      publicId: data.public_id,
    });

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('❌ Error en fetch:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al subir imagen a Cloudinary');
  }
}



