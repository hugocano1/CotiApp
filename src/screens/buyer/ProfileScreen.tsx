// src/screens/buyer/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../services/auth/config/supabaseClient';
import { COLORS } from '../../constants/colors';

// Componentes reutilizables (puedes moverlos a un archivo aparte en el futuro)
const InfoItem = ({ icon, text, value }: any) => ( <View style={styles.infoRow}><Icon name={icon} type="material-community" color={COLORS.secondary} size={24} /><View style={styles.infoCol}><Text style={styles.infoLabel}>{text}</Text><Text style={styles.infoValue}>{value}</Text></View></View> );
const ListItem = ({ icon, text, onPress }: any) => ( <TouchableOpacity style={styles.listItem} onPress={onPress}><View style={{flexDirection: 'row', alignItems: 'center'}}><Icon name={icon} type="material-community" color={COLORS.primary} size={24} /><Text style={styles.listItemText}>{text}</Text></View><Icon name="chevron-right" type="material-community" color={COLORS.gray} /></TouchableOpacity> );

export default function BuyerProfileScreen() {
  const { session } = useAuth();
  const { profile, loading } = useUserProfile();

  if (loading || !profile) {
    return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Avatar size={100} rounded source={{ uri: profile.foto_perfil || undefined }} title={(profile.nombre || 'C').substring(0, 2).toUpperCase()} containerStyle={styles.avatar} />
          <Text style={styles.name}>{profile.nombre} {profile.apellido || ''}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material-community" color={COLORS.accent} size={20} />
            <Text style={styles.ratingText}>{profile.calificacion_comprador?.toFixed(1) || 'Sin calificación'}</Text>
          </View>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Información de la Cuenta</Card.Title>
          <Card.Divider />
          <InfoItem icon="email" text="Correo Electrónico" value={session?.user?.email || ''} />
          <InfoItem icon="map-marker" text="Dirección" value={profile.direccion || 'No especificada'} />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>Acciones</Card.Title>
          <Card.Divider />
          <ListItem icon="pencil-outline" text="Editar Perfil" onPress={() => { /* Lógica futura de edición */ }} />
          <ListItem icon="credit-card" text="Métodos de Pago" onPress={() => { /* Lógica futura */ }} />
        </Card>

        <View style={styles.logoutButtonContainer}>
          <Button title="Cerrar Sesión" onPress={() => supabase.auth.signOut()} type="clear" titleStyle={styles.logoutButtonTitle} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
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