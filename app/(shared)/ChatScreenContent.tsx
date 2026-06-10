// app/(shared)/ChatScreenContent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChatService, ChatMessage } from '../../src/services/chat.service';
import { StorageService } from '../../src/services/storage.service';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../constants/Colors';
import { scaleFont } from '../../src/utils/responsive';

export default function ChatScreenContent() {
  const { orderId } = useLocalSearchParams();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingImage, setSendingImage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    if (!orderId || typeof orderId !== 'string') return;
    try {
      const history = await ChatService.getMessages(orderId);
      setMessages(history);
      if (session?.user?.id) {
        await ChatService.markMessagesAsRead(orderId, session.user.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId, session?.user?.id]);

  useEffect(() => {
    if (!orderId || typeof orderId !== 'string') {
      setLoading(false);
      return;
    }

    fetchMessages();

    console.log(`Subscribing to chat:${orderId}`);
    const channel = ChatService.subscribeToMessages(orderId, (newMessage) => {
      console.log("New message received via Realtime:", newMessage);
      setMessages((prev) => {
        if (prev.find(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      if (session?.user?.id) {
        ChatService.markMessagesAsRead(orderId, session.user.id);
      }
    });

    channel.subscribe((status) => {
      console.log(`Realtime status for chat:${orderId}:`, status);
    });

    return () => {
      console.log(`Unsubscribing from chat:${orderId}`);
      channel.unsubscribe();
    };
  }, [orderId, fetchMessages, session?.user?.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !orderId || typeof orderId !== 'string') return;
    const textToSend = inputText.trim();
    setInputText('');
    try {
      await ChatService.sendMessage(orderId, textToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handlePickImage = async () => {
    if (!orderId || typeof orderId !== 'string') return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSendingImage(true);
        const uri = result.assets[0].uri;
        
        // 1. Subir a Storage
        const publicUrl = await StorageService.uploadChatMessage(uri, orderId);
        
        // 2. Enviar mensaje de chat con la URL
        await ChatService.sendMessage(orderId, publicUrl, true);
      }
    } catch (error: any) {
      console.error("Error al enviar imagen:", error);
      Alert.alert("Error", "No se pudo enviar la imagen: " + error.message);
    } finally {
      setSendingImage(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMine = item.sender_id === session?.user?.id;
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        {item.is_image ? (
          <Image 
            source={item.content ? { uri: item.content } : { uri: 'https://via.placeholder.com/200' }} 
            style={styles.messageImage} 
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
        )}
        <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!orderId || typeof orderId !== 'string') {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" type="material-community" color={COLORS.danger} size={50} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Error: ID de pedido no válido</Text>
        <Button title="Volver" onPress={() => router.back()} type="clear" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      {/* Header Personalizado */}
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" type="material-community" color={COLORS.white} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat del Pedido</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {sendingImage ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
          ) : (
            <TouchableOpacity onPress={handlePickImage} style={styles.attachButton}>
              <Icon name="camera" type="material-community" color={COLORS.primary} size={28} />
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe un mensaje..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" type="material-community" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60,
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
  backButton: {
    padding: 5,
  },
  keyboardView: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 2,
  },
  messageText: { fontSize: scaleFont(15) },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  myMessageText: { color: 'white' },
  theirMessageText: { color: COLORS.text },
  messageTime: { fontSize: scaleFont(10), marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },
  theirMessageTime: { color: COLORS.gray },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  attachButton: {
    marginRight: 10,
    padding: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: scaleFont(15),
    maxHeight: 100,
    marginRight: 10,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
