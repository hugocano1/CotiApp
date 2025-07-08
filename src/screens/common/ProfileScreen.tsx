import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/auth/config/supabaseClient';
import { COLORS } from '../../constants/colors';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { session } = useAuth();
  const { profile, role, loading } = useUserProfile();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para los campos editables
  const [editedName, setEditedName] = useState('');
  const [editedApellido, setEditedApellido] = useState('');
  const [editedDireccion, setEditedDireccion] = useState('');
  
  // Sincroniza los estados editables cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      setEditedName(profile.nombre || '');
      setEditedApellido(profile.apellido || '');
      setEditedDireccion(profile.direccion || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!session?.user || !role) return;
    setSaving(true);
    try {
      const targetTable = role === 'buyer' ? 'buyer_profiles' : 'seller_profiles';
      const updates = { nombre: editedName, apellido: editedApellido, direccion: editedDireccion };
      
      const { error } = await supabase.from(targetTable).update(updates).eq('user_id', session.user.id);
      if (error) throw error;
      
      Alert.alert("Éxito", "Perfil actualizado.");
      setEditMode(false);
      // Aquí se podría forzar una recarga del perfil si fuera necesario
    } catch (error: any) {
      Alert.alert("Error", `No se pudo guardar el perfil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!profile) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
        <Button title="Cerrar Sesión" onPress={handleLogout} color={COLORS.secondary} />
      </View>
    );
  }

  const displayName = profile.nombre || 'Usuario';
  const rating = role === 'buyer' ? profile.calificacion_comprador : profile.calificacion_vendedor;
  const avatarUrl = profile.foto_perfil || profile.store_logo_url;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Avatar size={100} rounded source={{ uri: avatarUrl || undefined }} title={displayName.substring(0, 2).toUpperCase()} containerStyle={styles.avatar} />
          <Text style={styles.name}>{profile.nombre} {profile.apellido || ''}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material-community" color={COLORS.accent} size={20} />
            <Text style={styles.ratingText}>{rating?.toFixed(1) || 'Sin calificación'}</Text>
          </View>
        </View>

        {editMode ? (
          // --- VISTA DE EDICIÓN ---
          <View style={styles.contentContainer}>
            <EditableInfoItem label="Nombre(s)" value={editedName} onChangeText={setEditedName} />
            <EditableInfoItem label="Apellido(s)" value={editedApellido} onChangeText={setEditedApellido} />
            <EditableInfoItem label="Dirección" value={editedDireccion} onChangeText={setEditedDireccion} />
            <View style={styles.buttonSection}>
              <Button title="Guardar Cambios" onPress={handleSaveProfile} buttonStyle={styles.actionButton} loading={saving}/>
              <Button title="Cancelar" onPress={() => setEditMode(false)} type="clear" titleStyle={styles.cancelButtonTitle} />
            </View>
          </View>
        ) : (
          // --- VISTA DE VISUALIZACIÓN ---
          <>
            <Card containerStyle={styles.card}>
              <Card.Title>Información de la Cuenta</Card.Title>
              <Card.Divider />
              <InfoItem icon="email" text="Correo Electrónico" value={session?.user.email || ''} />
              <InfoItem icon="account-circle" text="Tipo de Perfil" value={role === 'buyer' ? 'Comprador' : 'Vendedor'} />
              <InfoItem icon="map-marker" text="Dirección" value={profile.direccion || 'No especificada'} />
            </Card>

            <Card containerStyle={styles.card}>
              <Card.Title>Acciones</Card.Title>
              <Card.Divider />
              <ListItem icon="pencil-outline" text="Editar Perfil" onPress={() => setEditMode(true)} />
              {role === 'buyer' && <ListItem icon="credit-card" text="Métodos de Pago" onPress={() => {}} />}
            </Card>
            
            <View style={styles.logoutButtonContainer}>
               <Button title="Cerrar Sesión" onPress={handleLogout} type="clear" titleStyle={styles.logoutButtonTitle} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Componentes reutilizables
const InfoItem = ({ icon, text, value }: any) => (<View style={styles.infoRow}><Icon name={icon} type="material-community" color={COLORS.secondary} size={24} /><View style={styles.infoCol}><Text style={styles.infoLabel}>{text}</Text><Text style={styles.infoValue}>{value}</Text></View></View>);
const ListItem = ({ icon, text, onPress }: any) => (<TouchableOpacity style={styles.listItem} onPress={onPress}><View style={{flexDirection: 'row', alignItems: 'center'}}><Icon name={icon} type="material-community" color={COLORS.primary} size={24} /><Text style={styles.listItemText}>{text}</Text></View><Icon name="chevron-right" type="material-community" color={COLORS.gray} /></TouchableOpacity>);
const EditableInfoItem = ({ label, value, onChangeText }: any) => (<View style={styles.editableRow}><Text style={styles.infoLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} style={styles.infoInput} /></View>);

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    headerContainer: { backgroundColor: COLORS.primary, alignItems: 'center', paddingVertical: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    avatar: { borderWidth: 4, borderColor: COLORS.accent },
    name: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 12 },
    contentContainer: { padding: 20,},
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 16, color: COLORS.white, opacity: 0.8, marginLeft: 5 },
    card: { borderRadius: 10, marginHorizontal: 15, marginTop: 20, marginBottom: 0, padding: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    infoCol: { marginLeft: 15 },
    infoLabel: { color: COLORS.gray, fontSize: 14, marginBottom: 2 },
    infoValue: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
    listItemText: { fontSize: 16, color: COLORS.text, marginLeft: 15 },
    editableRow: { paddingVertical: 10 },
    infoInput: { fontSize: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingVertical: 5, color: COLORS.text },
    buttonSection: { paddingHorizontal: 20, marginTop: 30 },
    actionButton: { backgroundColor: COLORS.secondary, borderRadius: 8, paddingVertical: 10 },
    cancelButtonTitle: { color: COLORS.gray, fontWeight: 'bold' },
    logoutButtonContainer: { marginTop: 20, paddingBottom: 40 },
    logoutButtonTitle: { color: '#E53935', fontSize: 16, fontWeight: 'bold' }
    
});