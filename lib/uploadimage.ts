const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Envio de fotos não configurado: defina as variáveis do Cloudinary no .env.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  }).catch(() => {
    throw new Error('Não foi possível enviar a foto. Confira sua conexão e tente novamente.');
  });

  if (!response.ok) {
    throw new Error('Não foi possível enviar a foto. Tente novamente.');
  }

  const data: { secure_url: string } = await response.json();
  return data.secure_url; 
}