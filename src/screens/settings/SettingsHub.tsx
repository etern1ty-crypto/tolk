import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, User, Smartphone, Palette, HardDrive, Bell, Shield, Ban, HelpCircle, LogOut } from 'lucide-react-native';
import { useAppStore } from '../../store/appStore';
import { tokens } from '../../theme/tokens';

export const SettingsHub = () => {
  const insets = useSafeAreaInsets();
  const closeSettings = useAppStore((state) => state.closeSettings);
  const navigateSettings = useAppStore((state) => state.navigateSettings);
  const logout = useAppStore((state) => state.logout);

  const renderSection = (title: string, icon: React.ReactNode, onPress?: () => void, color: string = tokens.colors.text.primary) => (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.sectionIcon}>
        {icon}
      </View>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={closeSettings} style={styles.backButton}>
          <ChevronLeft color={tokens.colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + tokens.spacing.xl }]}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigateSettings('account')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Н</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Nekach</Text>
            <Text style={styles.profileUsername}>@nekach</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionGroup}>
          <Text style={styles.groupHeader}>Аккаунт</Text>
          {renderSection('Профиль', <User color={tokens.colors.text.primary} size={20} />, () => navigateSettings('account'))}
          {renderSection('Устройства и сессии', <Smartphone color={tokens.colors.text.primary} size={20} />, () => navigateSettings('sessions'))}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.groupHeader}>Чаты и сообщения</Text>
          {renderSection('Оформление', <Palette color={tokens.colors.text.primary} size={20} />)}
          {renderSection('Медиа и хранилище', <HardDrive color={tokens.colors.text.primary} size={20} />)}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.groupHeader}>Безопасность и уведомления</Text>
          {renderSection('Уведомления', <Bell color={tokens.colors.text.primary} size={20} />)}
          {renderSection('Конфиденциальность', <Shield color={tokens.colors.text.primary} size={20} />)}
          {renderSection('Чёрный список', <Ban color={tokens.colors.text.primary} size={20} />, () => navigateSettings('blocklist'))}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.groupHeader}>Прочее</Text>
          {renderSection('О приложении', <HelpCircle color={tokens.colors.text.primary} size={20} />)}
        </View>

        <View style={styles.sectionGroup}>
          {renderSection('Выйти', <LogOut color={tokens.colors.status.error} size={20} />, logout, tokens.colors.status.error)}
        </View>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  avatarText: {
    color: tokens.colors.bg.primary,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semiBold,
    marginBottom: tokens.spacing.xs,
  },
  profileUsername: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.md,
  },
  sectionGroup: {
    marginBottom: tokens.spacing.xl,
  },
  groupHeader: {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginBottom: 2,
  },
  sectionIcon: {
    marginRight: tokens.spacing.md,
    width: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
  },
});
