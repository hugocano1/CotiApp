// Ruta: app/(buyer)/perfil.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Avatar, Card, Icon, Button, BottomSheet, ListItem } from '@rneui/themed';
import { useAuth } from '../../src/hooks/useAuth';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { supabase } from '../../src/services/auth/config/supabaseClient';
import { StorageService } from '../../src/services/storage.service';
import { COLORS } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scaleFont } from '../../src/utils/responsive';
import { BuyerProfile } from '../../src/types/entities';
import { AuthService } from '../../src/services/auth/auth.service'; // ✅ IMPORTADO

const InfoItem = ({ icon, text, value }: { icon: string, text: string, value: string | number }) => {
    return (
        <View style={styles.infoRow}>
            <Icon name={icon} type="material-community" color={COLORS.secondary} size={24} />
            <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>{text}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
};

interface EditableInfoItemProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const EditableInfoItem = ({ label, value, onChangeText, keyboardType = 'default' }: EditableInfoItemProps) => {
    return (
        <View style={styles.editableRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <TextInput value={value} onChangeText={onChangeText} style={styles.infoInput} keyboardType={keyboardType} />
        </View>
    );
};

const GENDERS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];

export default function BuyerProfileScreen() {
    const { session } = useAuth();
    const { profile, role, loading, refreshProfile } = useUserProfile();
    
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [editedName, setEditedName] = useState('');
    const [editedApellido, setEditedApellido] = useState('');
    const [editedDireccion, setEditedDireccion] = useState('');
    const [editedBirthDate, setEditedBirthDate] = useState<Date | undefined>(undefined);
    const [editedGender, setEditedGender] = useState('');
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isGenderPickerVisible, setGenderPickerVisible] = useState(false);

    useEffect(() => {
        if (role === 'buyer' && profile) {
            const buyerProfile = profile as BuyerProfile;
            setEditedName(buyerProfile.nombre || '');
            setEditedApellido(buyerProfile.apellido || '');
            setEditedDireccion(buyerProfile.direccion || '');
            setEditedGender(buyerProfile.gender || '');
            if (buyerProfile.birth_date) {
                setEditedBirthDate(new Date(buyerProfile.birth_date));
            }
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
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled && result.assets.length > 0) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        if (!session?.user || role !== 'buyer' || !profile) return;
        setSaving(true);
        let finalPhotoUrl = profile.foto_perfil;
        try {
            if (selectedImageUri) {
                const publicUrl = await StorageService.uploadProfileImage(selectedImageUri, session.user.id, 'buyer');
                finalPhotoUrl = publicUrl;
            }
            const updates = { 
                nombre: editedName, 
                apellido: editedApellido, 
                direccion: editedDireccion, 
                foto_perfil: finalPhotoUrl,
                birth_date: editedBirthDate ? editedBirthDate.toISOString().split('T')[0] : null,
                gender: editedGender
            };
            const { error } = await supabase.from('buyer_profiles').update(updates).eq('user_id', session.user.id);
            if (error) throw error;
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
    
    const calculateAge = (birthDateString: string | undefined) => {
        if (!birthDateString) return 'No establecido';
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading || !profile) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    if (role !== 'buyer') {
        return <View style={styles.centered}><Text>Perfil no válido</Text></View>;
    }

    const buyerProfile = profile as BuyerProfile;
    const displayName = editMode ? editedName : (buyerProfile.nombre || 'Usuario');
    const displayAvatar = selectedImageUri || buyerProfile.foto_perfil;
    const profileTypeText = 'Comprador Inteligente';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={!editMode}>
                        <View style={styles.avatarContainer}>
                            <Avatar size={120} rounded source={displayAvatar ? { uri: displayAvatar } : undefined} title={!displayAvatar ? displayName.substring(0, 2).toUpperCase() : undefined} imageProps={{ style: { resizeMode: 'cover' } }}>
                                {editMode && <View style={styles.editIconContainer}><Icon name="pencil" type="material-community" color="white" size={18} /></View>}
                            </Avatar>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.name}>{displayName} {editMode ? editedApellido : buyerProfile.apellido || ''}</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" type="material-community" color={COLORS.accent} size={20} />
                        <Text style={styles.ratingText}>{buyerProfile.calificacion_comprador?.toFixed(1) || 'Sin calificación'}</Text>
                    </View>
                </View>

                <Card containerStyle={styles.card}>
                    <Card.Title>Información de la Cuenta</Card.Title>
                    <Card.Divider />
                    <InfoItem icon="email-outline" text="Correo Electrónico" value={session?.user?.email || ''} />
                    <InfoItem icon="account-circle-outline" text="Tipo de Perfil" value={profileTypeText} />
                </Card>

                <Card containerStyle={styles.card}>
                    <Card.Title>Datos Personales</Card.Title>
                    <Card.Divider />
                    {editMode ? (
                        <>
                            <EditableInfoItem label="Nombre(s)" value={editedName} onChangeText={setEditedName} />
                            <EditableInfoItem label="Apellido(s)" value={editedApellido} onChangeText={setEditedApellido} />
                            <EditableInfoItem label="Dirección" value={editedDireccion} onChangeText={setEditedDireccion} />
                            
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectorButton}>
                                <Icon name="cake-variant-outline" type="material-community" color={COLORS.gray} />
                                <Text style={styles.selectorButtonText}>{editedBirthDate ? editedBirthDate.toLocaleDateString('es-ES') : 'Fecha de Nacimiento'}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker value={editedBirthDate || new Date()} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(Platform.OS === 'ios'); if(date) setEditedBirthDate(date); }} />
                            )}
                            
                            <TouchableOpacity onPress={() => setGenderPickerVisible(true)} style={styles.selectorButton}>
                                <Icon name="gender-male-female" type="material-community" color={COLORS.gray} />
                                <Text style={styles.selectorButtonText}>{editedGender || 'Seleccionar Género'}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <InfoItem icon="account-outline" text="Nombre Completo" value={`${buyerProfile.nombre || ''} ${buyerProfile.apellido || ''}`.trim() || 'No establecido'} />
                            <InfoItem icon="map-marker-outline" text="Dirección" value={buyerProfile.direccion || 'No establecido'} />
                            <InfoItem icon="cake-variant-outline" text="Edad" value={calculateAge(buyerProfile.birth_date)} />
                            <InfoItem icon="gender-male-female" text="Género" value={buyerProfile.gender || 'No establecido'} />
                        </>
                    )}
                </Card>
                
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

            <BottomSheet isVisible={isGenderPickerVisible} onBackdropPress={() => setGenderPickerVisible(false)}>
                {GENDERS.map((g, i) => (
                    <ListItem key={i} onPress={() => { setEditedGender(g); setGenderPickerVisible(false); }}>
                        <ListItem.Content>
                            <ListItem.Title>{g}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 10 },
    avatarContainer: { width: 124, height: 124, borderRadius: 62, borderWidth: 4, borderColor: COLORS.accent, backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: COLORS.white },
    name: { fontSize: scaleFont(24), fontWeight: 'bold', color: COLORS.white, marginTop: 12 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: scaleFont(16), color: COLORS.white, opacity: 0.8, marginLeft: 5 },
    card: { borderRadius: 12, marginHorizontal: 15, marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    infoCol: { marginLeft: 15, flex: 1 },
    infoLabel: { color: COLORS.gray, fontSize: scaleFont(12) },
    infoValue: { color: COLORS.text, fontSize: scaleFont(16) },
    editableRow: { paddingVertical: 10 },
    infoInput: { fontSize: scaleFont(16), borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingVertical: 5 },
    buttonSection: { paddingHorizontal: 20, marginTop: 10 },
    logoutButtonTitle: { color: COLORS.danger, fontWeight: 'bold', padding: 20 },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
        paddingVertical: 15,
        marginTop: 10
    },
    selectorButtonText: {
        fontSize: scaleFont(16),
        marginLeft: 10,
        color: COLORS.text,
    },
});