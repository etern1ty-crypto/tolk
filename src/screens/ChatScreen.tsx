import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';
import { ChevronLeft, Paperclip, Mic, Send, BellOff, AlertCircle } from 'lucide-react-native';

const DUMMY_MESSAGES = [
  { id: 'm_1', text: 'Hey, did you see the new design?', sender: 'other', time: '10:40' },
  { id: 'm_2', text: 'Yes, looking good! Added it to the wall.', sender: 'me', time: '10:42' },
  { id: 'm_3', text: 'This message failed to send.', sender: 'me', time: '10:45', status: 'failed' },
];

export const ChatScreen = () => {
  const activeChatId = useAppStore((state) => state.activeChatId);
  const setActiveChat = useAppStore((state) => state.setActiveChat);
  const addEcho = useAppStore((state) => state.addEcho);
  const [text, setText] = React.useState('');

  if (!activeChatId) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No chat selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButton}>
          <ChevronLeft color={tokens.colors.accent.primary} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat {activeChatId}</Text>
          <Text style={styles.headerSubtitle}>online</Text>
        </View>
        <TouchableOpacity style={styles.wallButton}>
          <Text style={styles.wallButtonText}>Стена</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_MESSAGES}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Здесь пока ничего нет.</Text>
            <Text style={styles.emptySubtext}>Напишите первое сообщение.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleOther,
            item.status === 'failed' && styles.messageBubbleFailed
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{item.time}</Text>
              {item.status === 'failed' && (
                <TouchableOpacity style={styles.retryButton}>
                  <AlertCircle color={tokens.colors.status.error} size={14} />
                  <Text style={styles.retryText}>Не отправлено</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TouchableOpacity style={styles.iconButton}>
          <Paperclip color={tokens.colors.text.secondary} size={24} />
        </TouchableOpacity>
        <TextInput 
          style={styles.input} 
          placeholder="Message..." 
          placeholderTextColor={tokens.colors.text.disabled}
          value={text}
          onChangeText={setText}
        />
        {text.length > 0 ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onLongPress={addEcho} 
            delayLongPress={300}
            onPress={() => setText('')}
          >
            <Send color={tokens.colors.accent.primary} size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton}>
            <Mic color={tokens.colors.text.secondary} size={24} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  backButton: {
    padding: tokens.spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
  },
  headerTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semiBold,
  },
  headerSubtitle: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.typography.sizes.xs,
  },
  wallButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    backgroundColor: tokens.colors.bg.surface,
    borderRadius: tokens.radius.pill,
  },
  wallButtonText: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
  },
  messageList: {
    padding: tokens.spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.sm,
  },
  messageBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: tokens.colors.border.strong,
    borderBottomRightRadius: tokens.radius.sm,
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.bg.surface,
    borderBottomLeftRadius: tokens.radius.sm,
  },
  messageBubbleFailed: {
    borderWidth: 1,
    borderColor: tokens.colors.status.error,
  },
  messageText: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    lineHeight: 16 * tokens.typography.lineHeights.base,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: tokens.spacing.xs,
  },
  messageTime: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
  },
  retryText: {
    color: tokens.colors.status.error,
    fontSize: tokens.typography.sizes.xs,
    marginLeft: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.bg.surface,
  },
  iconButton: {
    padding: tokens.spacing.sm,
  },
  input: {
    flex: 1,
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    maxHeight: 100,
    marginHorizontal: tokens.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleY: -1 }], // because FlatList is inverted
    paddingTop: tokens.spacing.xxl,
  },
  emptyText: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: tokens.spacing.xs,
  },
  emptySubtext: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
  }
});
