// Ruta: src/services/storage.service.ts
import { supabase } from './auth/config/supabaseClient';

export type UserRoleForStorage = 'buyer' | 'seller';

export class StorageService {

  /**
   * Sube la foto de perfil de un usuario y devuelve la URL pública.
   * USA FormData para una subida robusta desde React Native.
   * @param uri - La URI local del archivo de imagen (del ImagePicker).
   * @param userId - El ID del usuario al que pertenece la imagen.
   * @param role - El rol del usuario ('buyer' o 'seller').
   * @returns La URL pública de la imagen subida.
   */
  static async uploadProfileImage(uri: string, userId: string, role: UserRoleForStorage): Promise<string> {
    // 1. Estandarizamos la ruta como antes.
    const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const folder = `${role}_avatars`;
    const filePath = `${folder}/${userId}/profile.${fileExt}`;

    // 2. Creamos un objeto FormData. Esta es la forma robusta de subir archivos.
    const formData = new FormData();
    // La librería de Supabase espera que el archivo se adjunte como un objeto
    // con la uri, el tipo y el nombre.
    formData.append('file', {
      uri: uri,
      type: `image/${fileExt}`,
      name: `profile.${fileExt}`,
    } as any);

    // 3. Subimos el objeto FormData a Supabase Storage.
    // Pasamos el formData directamente en lugar del blob.
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Error en Supabase Storage:", uploadError);
      throw new Error(`Error de Supabase Storage: ${uploadError.message}`);
    }

    // 4. Obtenemos y retornamos la URL pública (esto no cambia).
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    if (!data.publicUrl) {
      throw new Error("No se pudo obtener la URL pública del archivo.");
    }
    
    return `${data.publicUrl}?t=${new Date().getTime()}`;
  }
}