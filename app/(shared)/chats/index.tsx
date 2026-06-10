import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Icon, ListItem, Avatar } from '@rneui/themed';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatService, ChatSummary } from '../../../src/services/chat.service';
import { COLORS } from '../../../constants/Colors';
import { scaleFont } from '../../../src/utils/responsive';

export default function InboxScreen() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchChats = useCallback(async () => {
    try {
      const activeChats = await ChatService.getActiveChats();
      setChats(activeChats);
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const renderChatItem = ({ item }: { item: ChatSummary }) => (
    <ListItem
      onPress={() => router.push({ pathname: "/(shared)/chat/[orderId]", params: { orderId: item.id } })}
      bottomDivider
      containerStyle={styles.chatItem}
    >
      <Avatar
        rounded
        title={item.other_party_name?.charAt(0).toUpperCase() || 'U'}
        containerStyle={{ backgroundColor: COLORS.secondary }}
      />
      <ListItem.Content>
        <View style={styles.chatHeader}>
          <ListItem.Title style={styles.userName}>{item.other_party_name}</ListItem.Title>
          <Text style={styles.timeText}>
            {item.last_message_at ? new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        <ListItem.Subtitle style={styles.listTitle} numberOfLines={1}>
          Pedido: {item.list_title}
        </ListItem.Subtitle>
        <ListItem.Subtitle style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Inicia la conversación...'}
        </ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Personalizado */}
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" type="material-community" color={COLORS.white} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Mensajes</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="message-off-outline" type="material-community" color={COLORS.gray} size={60} />
            <Text style={styles.emptyText}>No tienes chats activos en este momento.</Text>
            <Text style={styles.emptySubText}>Los chats aparecen cuando tienes un pedido en curso.</Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
  backButton: { padding: 5 },
  chatItem: { backgroundColor: 'white' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  userName: { fontWeight: 'bold', fontSize: scaleFont(15), color: COLORS.text },
  timeText: { fontSize: scaleFont(11), color: COLORS.gray },
  listTitle: { fontSize: scaleFont(13), color: COLORS.primary, fontWeight: '500', marginTop: 2 },
  lastMessage: { fontSize: scaleFont(13), color: COLORS.gray, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', fontSize: scaleFont(16), fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
  emptySubText: { textAlign: 'center', fontSize: scaleFont(14), color: COLORS.gray, marginTop: 10 },
});
