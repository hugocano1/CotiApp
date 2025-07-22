// app/(buyer)/perfil.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useAuth } from '../../src/hooks/useAuth';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { COLORS } from '../../src/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';

// Componente reutilizable para las acciones
const ListItem = ({ icon, text, onPress }: { icon: string, text: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Icon name={icon} type="material-community" color={COLORS.primary} size={24} />
      <Text style={styles.listItemText}>{text}</Text>
    </View>
    <Icon name="chevron-right" type="material-community" color={COLORS.gray} />
  </TouchableOpacity>
);

export default function BuyerProfileScreen() {
  const { session } = useAuth();
  const { profile, loading, refreshProfile } = useUserProfile();
  
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para los campos editables
  const [editedName, setEditedName] = useState('');
  const [editedApellido, setEditedApellido] = useState('');
  const [editedDireccion, setEditedDireccion] = useState('');
  const [editedPhotoUrl, setEditedPhotoUrl] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Sincroniza los estados editables cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      setEditedName(profile.nombre || '');
      setEditedApellido(profile.apellido || '');
      setEditedDireccion(profile.direccion || '');
      setEditedPhotoUrl(profile.foto_perfil || '');
    }
  }, [profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Se necesitan permisos para acceder a la galería.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
      setEditedPhotoUrl(result.assets[0].uri); // Previsualización inmediata
    }
  };

  const uploadImage = async (uri: string, userId: string) => {
    const fileExt = uri.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `buyer_avatars/${fileName}`;
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, { upsert: true }); // upsert: true para reemplazar la foto anterior
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    if (!session?.user) return;
    setSaving(true);
    let finalPhotoUrl = editedPhotoUrl;
    try {
      if (selectedImageUri) {
        const publicUrl = await uploadImage(selectedImageUri, session.user.id);
        if(publicUrl) finalPhotoUrl = publicUrl;
      }
      const updates = { 
        nombre: editedName, 
        apellido: editedApellido, 
        direccion: editedDireccion, 
        foto_perfil: finalPhotoUrl 
      };
      const { error } = await supabase.from('buyer_profiles').update(updates).eq('user_id', session.user.id);
      if (error) throw error;
      
      Alert.alert("Éxito", "Perfil actualizado.");
      setEditMode(false);
      setSelectedImageUri(null);
      if (refreshProfile) refreshProfile(); // Refrescar datos para ver los cambios
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading || !profile) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const displayName = editMode ? editedName : profile.nombre;
  const displayAvatar = selectedImageUri || editedPhotoUrl;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={editMode ? pickImage : undefined} activeOpacity={0.7}>
            <Avatar size={100} rounded source={{ uri: displayAvatar || undefined }} title={(displayName || 'C').substring(0, 2).toUpperCase()} containerStyle={styles.avatar}>
              {editMode && <Avatar.Accessory size={24} />}
            </Avatar>
          </TouchableOpacity>
          {editMode ? (
            <TextInput value={editedName} onChangeText={setEditedName} style={styles.nameInput} placeholder="Nombre" />
          ) : (
            <Text style={styles.name}>{profile.nombre} {profile.apellido || ''}</Text>
          )}
          <Text style={styles.email}>{session.user.email}</Text>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Información de la Cuenta</Card.Title>
          <Card.Divider />
          <EditableInfoItem label="Apellido" value={editedApellido} onChangeText={setEditedApellido} isEditing={editMode} />
          <EditableInfoItem label="Dirección" value={editedDireccion} onChangeText={setEditedDireccion} isEditing={editMode} />
        </Card>

        <View style={styles.buttonSection}>
          {editMode ? (
            <>
              <Button title="Guardar Cambios" onPress={handleSaveProfile} buttonStyle={{backgroundColor: COLORS.secondary}} loading={saving}/>
              <Button title="Cancelar" onPress={() => setEditMode(false)} type="clear" titleStyle={{color: COLORS.gray, marginTop: 10}}/>
            </>
          ) : (
            <Button title="Editar Perfil" onPress={() => setEditMode(true)} buttonStyle={{backgroundColor: COLORS.secondary}} icon={{name: 'pencil-outline', type: 'material-community', color: 'white'}}/>
          )}
        </View>
        
        <Button title="Cerrar Sesión" onPress={() => supabase.auth.signOut()} type="clear" titleStyle={styles.logoutButtonTitle} />
      </ScrollView>
    </SafeAreaView>
  );
}

const EditableInfoItem = ({ label, value, onChangeText, isEditing }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isEditing ? (
      <TextInput value={value} onChangeText={onChangeText} style={styles.infoInput} placeholder={`Tu ${label.toLowerCase()}`}/>
    ) : (
      <Text style={styles.infoValue}>{value || 'No establecido'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  avatar: { borderWidth: 4, borderColor: COLORS.accent },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 12 },
  nameInput: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginTop: 10, borderBottomWidth: 1, borderColor: 'white', textAlign: 'center', paddingBottom: 5, width: '80%' },
  email: { fontSize: 14, color: COLORS.white, opacity: 0.8 },
  card: { borderRadius: 10 },
  infoRow: { paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: COLORS.gray, marginBottom: 4 },
  infoValue: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  infoInput: { fontSize: 16, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingVertical: 5 },
  buttonSection: { padding: 20 },
  logoutButtonTitle: { color: 'red', fontWeight: 'bold', padding: 20 }
});