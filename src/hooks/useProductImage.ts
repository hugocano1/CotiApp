import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/src/services/auth/config/supabaseClient';
import { decode } from 'base64-arraybuffer';

// Definimos el formato de guardado para que sea más legible
const saveOptions: ImageManipulator.SaveOptions = {
  compress: 0.6, // Calidad de compresión (60%)
  format: ImageManipulator.SaveFormat.WEBP, // Formato WEBP para máxima optimización
};

// Dimensiones objetivo para la imagen
const IMAGE_DIMENSIONS = { width: 500, height: 500 };

/**
 * Hook personalizado para manejar la selección, manipulación y subida de imágenes de productos.
 * Encapsula toda la lógica: permisos, selección, redimensión, compresión, subida y obtención de URL.
 * @returns {object} Un objeto con la función para manejar la subida y los estados de carga y error.
 */
export const useProductImage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Orquesta todo el flujo de selección y subida de imagen.
   */
  const handlePickAndUploadImage = async (): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      // 1. Presentar al usuario la opción de elegir la fuente de la imagen
      const source = await new Promise<'camera' | 'gallery' | null>((resolve) => {
        Alert.alert(
          "Añadir Imagen",
          "¿Desde dónde quieres añadir la imagen?",
          [
            { text: "Tomar Foto", onPress: () => resolve('camera') },
            { text: "Elegir de Galería", onPress: () => resolve('gallery') },
            { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
          ]
        );
      });

      if (source === null) {
        setUploading(false);
        return null; // El usuario canceló
      }

      let result: ImagePicker.ImagePickerResult;

      // 2. Pedir permisos y lanzar el selector apropiado
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Lo sentimos, necesitamos permisos para usar la cámara.');
          return null;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Lo sentimos, necesitamos permisos para acceder a tus fotos.');
          return null;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1, // Calidad máxima en la selección, la compresión la hacemos luego
        });
      }

      // Si el usuario cancela, no hacemos nada
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      const selectedImage = result.assets[0];

      // 3. Manipular la imagen (redimensionar, comprimir, convertir a WEBP)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: IMAGE_DIMENSIONS }],
        { ...saveOptions, base64: true } // Pedimos base64 para la subida
      );
      
      if (!manipulatedImage.base64) {
        throw new Error("No se pudo obtener la imagen en formato Base64 para la subida.");
      }

      // 4. Subir la imagen procesada a Supabase Storage
      const fileName = `${Date.now()}.webp`;
      const bucketName = 'product-images';
      
      // Decodificamos de Base64 a ArrayBuffer, que es lo que espera Supabase
      const arrayBuffer = decode(manipulatedImage.base64);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: 'image/webp',
          upsert: false, // No sobrescribir si ya existe (aunque el nombre es único)
        });

      if (uploadError) {
        throw uploadError;
      }

      // 5. Obtener la URL pública de la imagen recién subida
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
        
      if (!publicUrlData.publicUrl) {
          throw new Error("No se pudo obtener la URL pública de la imagen.");
      }

      console.log('Imagen subida con éxito:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;

    } catch (e: any) {
      console.error('Error en el proceso de imagen:', e);
      setError(e.message || 'Ocurrió un error desconocido al procesar la imagen.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { handlePickAndUploadImage, uploading, error };
};
