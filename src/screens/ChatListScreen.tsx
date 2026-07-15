import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';
import { Settings, Search, Edit2, WifiOff, Wifi } from 'lucide-react-native';
// Mock data import, adjust path if needed or hardcode here
// Assuming data_model.ts is at docs/data_model.ts, we'll just mock here for simplicity

const DUMMY_CHATS = [
  { id: 'c_1', title: 'Nekach', preview: 'Hello from Tolk MVP!', unread: 1, time: '10:42' },
  { id: 'c_2', title: 'Design Team', preview: 'Wall updated', unread: 0, time: 'Yesterday' },
];

export const ChatListScreen = () => {
  const setActiveChat = useAppStore((state) => state.setActiveChat);
  const openSettings = useAppStore((state) => state.openSettings);
  const isOffline = useAppStore((state) => state.isOffline);
  const toggleOffline = useAppStore((state) => state.toggleOffline);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openSettings} accessibilityRole="button" accessibilityLabel="Настройки">
          <Settings color={tokens.colors.text.secondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tolk</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleOffline} style={{ marginRight: tokens.spacing.sm }} accessibilityRole="button" accessibilityLabel="Переключить сеть">
            {isOffline ? <WifiOff color={tokens.colors.status.error} size={20} /> : <Wifi color={tokens.colors.text.secondary} size={20} />}
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Поиск">
            <Search color={tokens.colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>У вас пока нет чатов.</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Начать общение</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.row}
            onPress={() => setActiveChat(item.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.title[0]}</Text>
            </View>
            <View style={styles.content}>
              <View style={styles.rowHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <Edit2 color={tokens.colors.bg.primary} size={24} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  headerTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semiBold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: tokens.spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  avatarText: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  content: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  title: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
  },
  time: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.xs,
  },
  preview: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
  },
  badge: {
    backgroundColor: tokens.colors.border.strong,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: tokens.spacing.sm,
  },
  badgeText: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
  },
  fab: {
    position: 'absolute',
    bottom: tokens.spacing.xl,
    right: tokens.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: tokens.spacing.xxl * 2,
  },
  emptyText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.md,
    marginBottom: tokens.spacing.lg,
  },
  emptyButton: {
    backgroundColor: tokens.colors.bg.surface,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.pill,
  },
  emptyButtonText: {
    color: tokens.colors.accent.primary,
    fontWeight: tokens.typography.weights.medium,
  }
});
