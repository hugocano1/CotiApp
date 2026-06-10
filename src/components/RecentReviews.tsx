import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Icon, Avatar } from '@rneui/themed';
import { OrderService } from '../services/order.service';
import { scaleFont } from '../utils/responsive';
import { COLORS } from '../../constants/Colors';

interface Props {
  userId: string;
  role: 'buyer' | 'seller';
}

export function RecentReviews({ userId, role }: Props) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getRecentReviewsForUser(userId, role)
      .then(data => setReviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, role]);

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 10 }} color={COLORS.primary} />;
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay reseñas públicas aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opiniones Recientes</Text>
      {reviews.map(review => (
        <View key={review.id} style={styles.reviewContainer}>
          <View style={styles.header}>
            <Avatar 
              size={32} 
              rounded 
              source={review.reviewerAvatar ? { uri: review.reviewerAvatar } : undefined}
              title={!review.reviewerAvatar ? review.reviewerName.substring(0, 2).toUpperCase() : undefined}
              containerStyle={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.nameAndRating}>
              <Text style={styles.reviewerName} numberOfLines={1}>{review.reviewerName}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" type="material-community" size={12} color={COLORS.star} />
                <Text style={styles.ratingText}>{review.rating}</Text>
                <Text style={styles.dateText}> • {new Date(review.date).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={styles.commentContainer}>
              <Text style={styles.commentText} numberOfLines={3}>{review.comment}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  emptyContainer: {
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scaleFont(13),
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  reviewContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nameAndRating: {
    marginLeft: 10,
    flex: 1.2, // Espacio para el nombre y calificación
  },
  reviewerName: {
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: scaleFont(11),
    fontWeight: 'bold',
    color: COLORS.star,
    marginLeft: 2,
  },
  dateText: {
    fontSize: scaleFont(10),
    color: COLORS.gray,
  },
  commentContainer: {
    flex: 2, // Más espacio para el comentario a la derecha
    marginLeft: 10,
    justifyContent: 'center',
  },
  commentText: {
    fontSize: scaleFont(11),
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'right',
  }
});
