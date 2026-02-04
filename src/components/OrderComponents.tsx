// src/components/OrderComponents.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import Colors from '@/constants/Colors'; // Import centralizado
import { useColorScheme } from '@/components/useColorScheme'; // Hook de tema
import { scaleFont } from '../utils/responsive';

export const StatusDisplay = ({ status }: { status: string }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // Lógica de status actualizada con el nuevo sistema de diseño
    const statusMap = {
        // Usamos LiziBrand (tint) para estados de éxito o progreso activo
        confirmed: { text: 'Por Despachar', color: themeColors.tint, icon: 'package-variant' }, 
        ready_for_pickup: { text: 'Listo para Recoger', color: themeColors.tint, icon: 'store-clock' },
        in_transit: { text: 'En Camino', color: themeColors.tint, icon: 'truck-delivery' },
        delivered_pending_confirmation: { text: 'Recibido (Pendiente Pago)', color: '#FF9800', icon: 'currency-usd' },
        completed: { text: 'Completado', color: '#4CAF50', icon: 'check-circle' },
        cancelled: { text: 'Cancelado', color: '#F44336', icon: 'close-circle' },
        // Usamos un gris para estados desconocidos o por defecto
        default: { text: status, color: Colors.light.tabIconDefault, icon: 'help-circle' },
    };
    const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.default;

    // Los estilos se definen aquí para usar los colores
    const styles = StyleSheet.create({
        statusDisplay: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 4, 
            paddingHorizontal: 8, 
            borderRadius: 16,
            backgroundColor: currentStatus.color
        },
        statusDisplayText: { 
            color: Colors.dark.text, // Texto siempre blanco para buen contraste
            fontSize: scaleFont(11), 
            fontWeight: 'bold', 
            marginLeft: 5 
        },
    });

    return (
        <View style={styles.statusDisplay}>
            <Icon name={currentStatus.icon} type="material-community" color={Colors.dark.text} size={18} />
            <Text style={styles.statusDisplayText}>{currentStatus.text}</Text>
        </View>
    );
};

export const CardTitle = ({ title, iconName }: { title: string, iconName?: string }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // Estilos que dependen del tema
    const styles = StyleSheet.create({
        cardTitleContainer: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8 
        },
        cardTitle: { 
            fontSize: scaleFont(16), 
            fontWeight: 'bold', 
            color: themeColors.text // <- LiziDark (en modo light)
        },
    });

    return (
        <View style={styles.cardTitleContainer}>
            {iconName && <Icon name={iconName} type="material-community" color={themeColors.text} size={20} containerStyle={{ marginRight: 8 }} />}
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
    );
};
