import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAppStore } from '../../store/appStore';
import { tokens } from '../../theme/tokens';

const MOCK_BLOCKED_USERS = [
  { id: 'u_99', name: 'Spammer Bot', username: '@free_crypto' },
  { id: 'u_100', name: 'Annoying Person', username: '@annoying' },
];

export const BlockReportScreen = () => {
  const insets = useSafeAreaInsets();
  const navigateSettings = useAppStore((state) => state.navigateSettings);
  
  const [blockedUsers, setBlockedUsers] = useState(MOCK_BLOCKED_USERS);

  const unblockUser = (id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateSettings('hub')} style={styles.backButton}>
          <ChevronLeft color={tokens.colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Чёрный список</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {blockedUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Чёрный список пуст.</Text>
          </View>
        ) : (
          blockedUsers.map(user => (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name[0]}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userUsername}>{user.username}</Text>
              </View>
              <TouchableOpacity style={styles.unblockButton} onPress={() => unblockUser(user.id)}>
                <Text style={styles.unblockText}>Разблокировать</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  backButton: {
    padding: tokens.spacing.xs,
    marginLeft: -tokens.spacing.xs,
  },
  headerTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semiBold,
  },
  content: {
    padding: tokens.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: tokens.spacing.xxl,
  },
  emptyStateText: {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.sizes.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.border.strong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  avatarText: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: 2,
  },
  userUsername: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
  },
  unblockButton: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  unblockText: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
  },
});
