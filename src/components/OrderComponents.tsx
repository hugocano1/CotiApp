// src/components/OrderComponents.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { COLORS } from '../constants/colors';
import { scaleFont } from '../utils/responsive';

export const StatusDisplay = ({ status }: { status: string }) => {
    const statusMap = {
        confirmed: { text: 'Por Despachar', color: COLORS.accent, icon: 'package-variant' }, 
        enviado: { text: 'En Camino', color: COLORS.primary, icon: 'truck-delivery' },
        completed: { text: 'Completado', color: COLORS.secondary, icon: 'check-circle' },
        default: { text: status, color: COLORS.gray, icon: 'help-circle' },
    };
    const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.default;

    return (
        <View style={[styles.statusDisplay, { backgroundColor: currentStatus.color }]}>
            <Icon name={currentStatus.icon} type="material-community" color={COLORS.white} size={18} />
            <Text style={styles.statusDisplayText}>{currentStatus.text}</Text>
        </View>
    );
};

export const CardTitle = ({ title, iconName }: { title: string, iconName?: string }) => (
    <View style={styles.cardTitleContainer}>
        {iconName && <Icon name={iconName} type="material-community" color={COLORS.primary} size={20} containerStyle={{ marginRight: 8 }} />}
        <Text style={styles.cardTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    statusDisplay: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16 },
    statusDisplayText: { color: COLORS.white, fontSize: scaleFont(11), fontWeight: 'bold', marginLeft: 5 },
    cardTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.primary },
});
