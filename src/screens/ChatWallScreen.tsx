import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';
import { ChevronRight } from 'lucide-react-native';

const DUMMY_WALL_ITEMS = [
  { id: 'w_1', title: 'Design Specs', preview: 'Check out the new tokens.', time: '10:42' },
];

export const ChatWallScreen = ({ jumpToChat }: { jumpToChat?: () => void }) => {
  const activeChatId = useAppStore((state) => state.activeChatId);

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
        <Text style={styles.headerTitle}>Стена</Text>
      </View>

      <FlatList
        data={DUMMY_WALL_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Стена пуста.</Text>
            <Text style={styles.emptySubtext}>Прикрепите медиа в чате, чтобы оно появилось здесь.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={jumpToChat}>
              <Text style={styles.emptyButtonText}>Вернуться в чат</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
            <Text style={styles.preview}>{item.preview}</Text>
            
            <TouchableOpacity style={styles.jumpButton} onPress={jumpToChat}>
              <Text style={styles.jumpButtonText}>В чат</Text>
              <ChevronRight color={tokens.colors.accent.ice} size={16} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
  header: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  headerTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  list: {
    padding: tokens.spacing.md,
  },
  card: {
    backgroundColor: tokens.colors.bg.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.border.strong,
    marginRight: tokens.spacing.sm,
  },
  title: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semiBold,
  },
  time: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.xs,
  },
  preview: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    marginBottom: tokens.spacing.md,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.border.subtle,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
  },
  jumpButtonText: {
    color: tokens.colors.accent.ice,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    marginRight: tokens.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: tokens.spacing.xxl * 2,
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
    textAlign: 'center',
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
