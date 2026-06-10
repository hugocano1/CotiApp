// Ruta: app/(seller)/perfil.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { Avatar, Card, Icon, Button } from '@rneui/themed';
import { useRouter } from 'expo-router'; // ✅ IMPORTADO
import { useAuth } from '../../src/hooks/useAuth';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { StorageService } from '../../src/services/storage.service';
import { COLORS } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { scaleFont } from '../../src/utils/responsive';
import { SellerProfile } from '../../src/types/entities';
import { AuthService } from '../../src/services/auth/auth.service'; // ✅ IMPORTADO

const InfoItem = ({ icon, text, value }: { icon: string, text: string, value: string | number }) => (
    <View style={styles.infoRow}>
        <Icon name={icon} type="material-community" color={COLORS.secondary} size={24} />
        <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{text}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

interface EditableInfoItemProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const EditableInfoItem = ({ label, value, onChangeText }: EditableInfoItemProps) => (
    <View style={styles.editableRow}>
        <Text style={styles.editableLabel}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} style={styles.infoInput} />
    </View>
);

export default function SellerProfileScreen() {
    const { session } = useAuth();
    const router = useRouter(); // ✅ INICIALIZADO
    const { profile, role, loading, refreshProfile } = useUserProfile();
    
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [editedName, setEditedName] = useState('');
    const [editedStoreName, setEditedStoreName] = useState('');
    const [editedStoreDescription, setEditedStoreDescription] = useState('');
    const [editedDireccion, setEditedDireccion] = useState('');
    const [editedHorario, setEditedHorario] = useState('');
    const [editedOpcionesEntrega, setEditedOpcionesEntrega] = useState('');
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    useEffect(() => {
        if (role === 'seller' && profile) {
            const sellerProfile = profile as SellerProfile;
            setEditedName(sellerProfile.nombre || '');
            setEditedStoreName(sellerProfile.stores?.name || '');
            setEditedStoreDescription(sellerProfile.store_description || '');
            setEditedDireccion(sellerProfile.stores?.direccion || '');
            setEditedHorario(sellerProfile.stores?.horario_atencion || '');
            setEditedOpcionesEntrega(sellerProfile.stores?.opciones_entrega || '');
        }
    }, [profile, role]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Denegado', 'Se necesitan permisos para acceder a la galería.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        if (!session?.user || role !== 'seller' || !profile) return;
        setSaving(true);

        const sellerProfile = profile as SellerProfile;

        try {
            const sellerProfileUpdates: { 
                nombre?: string; 
                store_description?: string; 
                foto_perfil?: string; 
            } = {
                nombre: editedName,
                store_description: editedStoreDescription,
            };

            if (selectedImageUri) {
                const imageUrl = await StorageService.uploadProfileImage(selectedImageUri, session.user.id, 'seller');
                sellerProfileUpdates.foto_perfil = imageUrl;
            }

            const { error: profileError } = await supabase.from('seller_profiles').update(sellerProfileUpdates).eq('user_id', session.user.id);
            if (profileError) throw profileError;

            if (sellerProfile.store_id) {
                const storeUpdates = {
                    name: editedStoreName,
                    direccion: editedDireccion,
                    horario_atencion: editedHorario,
                    opciones_entrega: editedOpcionesEntrega,
                };
                const { error: storeError } = await supabase.from('stores').update(storeUpdates).eq('id', sellerProfile.store_id);
                if (storeError) throw storeError;
            }
            
            Alert.alert("Éxito", "Perfil actualizado.");
            setEditMode(false);
            setSelectedImageUri(null);
            refreshProfile();
        } catch (error: any) {
            Alert.alert("Error al guardar", error.message);
        } finally {
            setSaving(false);
        }
    };

    // ✅ NUEVA FUNCIÓN DE LOGOUT
    const handleSignOut = async () => {
        try {
            await AuthService.signOut(session?.user);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };
    
    if (loading || !profile || role !== 'seller') {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    const sellerProfile = profile as SellerProfile;
    const storeName = editMode ? editedStoreName : (sellerProfile.stores?.name || 'Nombre Tienda');
    const sellerName = editMode ? editedName : (sellerProfile.nombre || 'Nombre Vendedor');
    
    const displayAvatar = selectedImageUri || sellerProfile.foto_perfil || sellerProfile.stores?.store_logo_url;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <ImageBackground source={require('../../assets/images/banner_vendedores.png')} style={styles.banner}>
                </ImageBackground>

                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={pickImage} disabled={!editMode} style={styles.avatarContainer}>
                        <Avatar 
                            size={120} 
                            rounded 
                            source={displayAvatar ? { uri: displayAvatar } : { uri: 'https://via.placeholder.com/120' }} 
                            title={!displayAvatar ? storeName.substring(0, 2).toUpperCase() : undefined}
                        >
                            {editMode && <View style={styles.editIconContainer}><Icon name="pencil" type="material-community" color="white" size={18} /></View>}
                        </Avatar>
                    </TouchableOpacity>
                    <Text style={styles.storeName}>{storeName}</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" type="material-community" color={COLORS.star} size={20} />
                        <Text style={styles.ratingText}>{sellerProfile.calificacion_vendedor?.toFixed(1) || 'N/A'}</Text>
                    </View>
                </View>

                {editMode ? (
                    <Card containerStyle={styles.card}>
                        <Card.Title>Editar Información</Card.Title>
                        <Card.Divider/>
                        <EditableInfoItem label="Nombre de la Tienda" value={editedStoreName} onChangeText={setEditedStoreName} />
                        <EditableInfoItem label="Descripción de la Tienda" value={editedStoreDescription} onChangeText={setEditedStoreDescription} />
                        <EditableInfoItem label="Dirección" value={editedDireccion} onChangeText={setEditedDireccion} />
                        <EditableInfoItem label="Horario de Atención" value={editedHorario} onChangeText={setEditedHorario} />
                        <EditableInfoItem label="Opciones de Entrega" value={editedOpcionesEntrega} onChangeText={setEditedOpcionesEntrega} />
                        <EditableInfoItem label="Nombre del Vendedor" value={editedName} onChangeText={setEditedName} />
                    </Card>
                ) : (
                    <Card containerStyle={styles.card}>
                        <Card.Title>Información de la Tienda</Card.Title>
                        <Card.Divider />
                        <Text style={styles.storeDescription}>{sellerProfile.store_description || 'No establecido'}</Text>
                        <InfoItem icon="map-marker-outline" text="Dirección" value={sellerProfile.stores?.direccion || 'No establecido'} />
                        <InfoItem icon="clock-outline" text="Horario" value={sellerProfile.stores?.horario_atencion || 'No establecido'} />
                        <InfoItem icon="truck-delivery-outline" text="Opciones de Entrega" value={sellerProfile.stores?.opciones_entrega || 'No establecido'} />
                    </Card>
                )}

                <Card containerStyle={styles.card}>
                    <Card.Title>Información del Vendedor</Card.Title>
                    <Card.Divider />
                    <InfoItem icon="account-outline" text="Nombre del Vendedor" value={sellerName} />
                    <InfoItem icon="email-outline" text="Correo Electrónico" value={session?.user?.email || 'No disponible'} />
                </Card>

                {/* --- Acceso Directo a Billetera --- */}
                {!editMode && (
                  <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={styles.walletButton} 
                        onPress={() => router.push('/(seller)/wallet')}
                    >
                        <View style={styles.walletContent}>
                            <Icon name="wallet" type="material-community" color="white" size={24} />
                            <Text style={styles.walletText}>Mi Billetera Lizi</Text>
                        </View>
                        <Icon name="chevron-right" type="material-community" color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={styles.buttonSection}>
                    {editMode ? (
                        <>
                            <Button title="Guardar Cambios" onPress={handleSaveProfile} buttonStyle={{ backgroundColor: COLORS.secondary }} loading={saving} />
                            <Button title="Cancelar" onPress={() => setEditMode(false)} type="clear" titleStyle={{ color: COLORS.gray, marginTop: 10 }} />
                        </>
                    ) : (
                        <Button title="Editar Perfil" onPress={() => setEditMode(true)} buttonStyle={{ backgroundColor: COLORS.secondary }} icon={{ name: 'pencil-outline', type: 'material-community', color: 'white' }} />
                    )}
                </View>
                {/* ✅ BOTÓN DE LOGOUT MODIFICADO */}
                <Button title="Cerrar Sesión" onPress={handleSignOut} type="clear" titleStyle={styles.logoutButtonTitle} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    banner: { height: 160, justifyContent: 'center', alignItems: 'center' },
    editBannerButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    headerContent: { alignItems: 'center', marginTop: -50 },
    avatarContainer: { borderWidth: 4, borderColor: 'white', borderRadius: 64, backgroundColor: '#e1e1e1' },
    editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
    storeName: { fontSize: scaleFont(22), fontWeight: 'bold', color: COLORS.primary, marginTop: 8 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: scaleFont(16), color: COLORS.text, opacity: 0.8, marginLeft: 5 },
    storeDescription: { textAlign: 'center', color: COLORS.text, fontSize: scaleFont(14), paddingHorizontal: 10, paddingVertical: 5 },
    card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 10, padding: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    infoCol: { marginLeft: 15, flex: 1 },
    infoLabel: { color: COLORS.gray, fontSize: scaleFont(11), textTransform: 'uppercase' },
    infoValue: { color: COLORS.text, fontSize: scaleFont(15), fontWeight: '500' },
    editableRow: { paddingVertical: 10 },
    editableLabel: { color: COLORS.primary, fontSize: scaleFont(14), fontWeight: '600', marginBottom: 5 },
    infoInput: { fontSize: scaleFont(16), borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingVertical: 8 },
    buttonSection: { paddingHorizontal: 20, marginTop: 5, marginBottom: 5 },
    logoutButtonTitle: { color: COLORS.danger, fontWeight: 'bold', padding: 20 },
    walletButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    walletContent: { flexDirection: 'row', alignItems: 'center' },
    walletText: { color: 'white', fontSize: scaleFont(16), fontWeight: 'bold', marginLeft: 12 },
});