// app/(main)/perfil.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useAuth } from '../../src/hooks/useAuth';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { COLORS } from '../../src/constants/colors';
import { Link } from 'expo-router';

// Componente reutilizable para las acciones
const ListItem = ({ icon, text, href }: { icon: string, text: string, href: string }) => (
  <Link href={href as any} asChild>
    <TouchableOpacity style={styles.listItem}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon name={icon} type="material-community" color={COLORS.primary} size={24} />
        <Text style={styles.listItemText}>{text}</Text>
      </View>
      <Icon name="chevron-right" type="material-community" color={COLORS.gray} />
    </TouchableOpacity>
  </Link>
);

export default function ProfileScreen() {
  const { session } = useAuth();
  const { profile, role, loading } = useUserProfile();

  if (loading || !profile) {
    return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const displayName = profile.nombre || 'Usuario';
  const rating = role === 'buyer' ? profile.calificacion_comprador : profile.calificacion_vendedor;
  const avatarUrl = role === 'buyer' ? profile.foto_perfil : profile.store_logo_url;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Avatar size={100} rounded source={{ uri: avatarUrl || undefined }} title={displayName.substring(0, 2).toUpperCase()} containerStyle={styles.avatar} />
          <Text style={styles.name}>{displayName} {profile.apellido || ''}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material-community" color={COLORS.accent} size={20} />
            <Text style={styles.ratingText}>{rating?.toFixed(1) || 'Sin calificación'}</Text>
          </View>
        </View>

        <Card containerStyle={styles.card}>
          <Card.Title>Información de la Cuenta</Card.Title>
          <Card.Divider />
          <InfoItem icon="email" text="Correo Electrónico" value={session?.user?.email || ''} />
          <InfoItem icon="map-marker" text="Dirección" value={profile.direccion || 'No especificada'} />
          {role === 'seller' && <InfoItem icon="store" text="Descripción" value={profile.store_description || 'No especificada'} />}
        </Card>

        <View style={styles.logoutButtonContainer}>
          <Button title="Cerrar Sesión" onPress={() => supabase.auth.signOut()} type="clear" titleStyle={styles.logoutButtonTitle} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, text, value }: { icon: string, text: string, value: string }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} type="material-community" color={COLORS.secondary} size={24} containerStyle={{ marginRight: 15 }} />
    <View>
      <Text style={styles.infoLabel}>{text}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: COLORS.primary },
  avatar: { borderWidth: 4, borderColor: COLORS.accent },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 16, color: COLORS.white, opacity: 0.8, marginLeft: 5 },
  card: { borderRadius: 10, marginHorizontal: 15, marginTop: 20, marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { color: COLORS.gray, fontSize: 14 },
  infoValue: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  listItemText: { fontSize: 16, color: COLORS.text, marginLeft: 15 },
  logoutButtonContainer: { paddingBottom: 40, paddingTop: 10 },
  logoutButtonTitle: { color: '#E53935', fontSize: 16, fontWeight: 'bold' }
});