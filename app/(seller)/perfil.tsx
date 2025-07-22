// app/(seller)/perfil.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useAuth } from '../../src/hooks/useAuth';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { COLORS } from '../../src/constants/colors';

// Componente reutilizable para mostrar información
const InfoRow = ({ label, value, isEditing, onChangeText, multiline = false }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isEditing ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.infoInput}
        multiline={multiline}
        placeholder={`Escribe ${label.toLowerCase()}...`}
      />
    ) : (
      <Text style={styles.infoValue}>{value || 'No establecido'}</Text>
    )}
  </View>
);


export default function SellerProfileScreen() {
  const { session } = useAuth();
  const { profile, loading, refreshProfile } = useUserProfile();
  
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para los campos editables
  const [editedName, setEditedName] = useState('');
  const [editedStoreName, setEditedStoreName] = useState('');
  const [editedStoreDescription, setEditedStoreDescription] = useState('');

  // Sincroniza los estados editables cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      setEditedName(profile.nombre || '');
      // Asumimos que la información de la tienda está anidada en 'stores'
      setEditedStoreName(profile.stores?.name || ''); 
      setEditedStoreDescription(profile.store_description || '');
    }
  }, [profile]);

  const handleSave = async () => {
  if (!profile || !session?.user) return; // Verificación inicial
  setSaving(true);
  try {
    // Guardar cambios en seller_profiles
    const { error: profileError } = await supabase
      .from('seller_profiles')
      .update({ nombre: editedName, store_description: editedStoreDescription })
      .eq('user_id', profile.user_id);
    if (profileError) throw profileError;

    // ✅ CORRECCIÓN: Solo actualizamos la tienda si tenemos un store_id
    if (profile.store_id) {
      const { error: storeError } = await supabase
        .from('stores')
        .update({ name: editedStoreName })
        .eq('id', profile.store_id);
      if (storeError) throw storeError;
    }

    Alert.alert("Éxito", "Perfil actualizado.");
    setEditMode(false);
    if(refreshProfile) refreshProfile();
  } catch (error: any) {
    Alert.alert("Error", error.message);
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    // Restaura los valores originales al cancelar
    if (profile) {
      setEditedName(profile.nombre || '');
      setEditedStoreName(profile.stores?.name || '');
      setEditedStoreDescription(profile.store_description || '');
    }
    setEditMode(false);
  };


  if (loading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
            <Avatar size={100} rounded source={{uri: profile?.store_logo_url}} title={(profile?.stores?.name || 'C').substring(0,2).toUpperCase()} containerStyle={styles.avatar} />
            <Text style={styles.name}>{editMode ? editedStoreName : profile?.stores?.name || 'Nombre de Tienda'}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" type="material-community" color={COLORS.accent} size={20} />
              <Text style={styles.ratingText}>{profile?.calificacion_vendedor?.toFixed(1) || 'Sin calificación'}</Text>
            </View>
        </View>

        <Card containerStyle={styles.card}>
            <Card.Title>Información de la Tienda</Card.Title>
            <Card.Divider/>
            <InfoRow label="Nombre del Vendedor" value={editMode ? editedName : profile?.nombre} isEditing={editMode} onChangeText={setEditedName} />
            <InfoRow label="Descripción" value={editMode ? editedStoreDescription : profile?.store_description} isEditing={editMode} onChangeText={setEditedStoreDescription} multiline={true} />
            <InfoRow label="Correo de Contacto" value={session?.user?.email} isEditing={false} />
        </Card>

        <View style={styles.buttonContainer}>
        {editMode ? (
            <>
                <Button title="Guardar Cambios" onPress={handleSave} loading={saving} buttonStyle={{backgroundColor: COLORS.secondary}} />
                <Button title="Cancelar" onPress={handleCancel} type="clear" titleStyle={{color: COLORS.gray, marginTop: 10}}/>
            </>
        ) : (
            <Button title="Editar Perfil y Tienda" onPress={() => setEditMode(true)} buttonStyle={{backgroundColor: COLORS.secondary}} />
        )}
        </View>
        <Button title="Cerrar Sesión" onPress={() => supabase.auth.signOut()} type="clear" titleStyle={{color: 'red', fontWeight: 'bold', padding: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { alignItems: 'center', padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    avatar: { borderWidth: 4, borderColor: COLORS.accent },
    name: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 10, textAlign: 'center' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    ratingText: { color: COLORS.white, marginLeft: 5, fontSize: 16 },
    card: { borderRadius: 12, margin: 15 },
    infoRow: { marginVertical: 10 },
    infoLabel: { fontSize: 14, color: COLORS.gray, marginBottom: 4 },
    infoValue: { fontSize: 16, color: COLORS.text },
    infoInput: { fontSize: 16, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingVertical: 4 },
    buttonContainer: { margin: 20 }
});