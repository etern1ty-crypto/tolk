import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Smartphone, Monitor, LogOut } from 'lucide-react-native';
import { useAppStore } from '../../store/appStore';
import { tokens } from '../../theme/tokens';

const MOCK_SESSIONS = [
  { id: 's_1', name: 'MacBook Pro', active: false, location: 'Moscow, RU', time: '12 hours ago', icon: 'desktop' },
  { id: 's_2', name: 'Chrome on Windows', active: false, location: 'St. Petersburg, RU', time: 'Yesterday', icon: 'desktop' },
];

export const SessionsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigateSettings = useAppStore((state) => state.navigateSettings);
  const logout = useAppStore((state) => state.logout);

  const handleTerminateAll = () => {
    Alert.alert(
      'Завершить другие сеансы?',
      'Вы выйдете из аккаунта на всех остальных устройствах.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Завершить', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const handleLogoutDevice = () => {
    Alert.alert(
      'Выйти из аккаунта?',
      'Вы будете выведены из системы на этом устройстве.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateSettings('hub')} style={styles.backButton}>
          <ChevronLeft color={tokens.colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Устройства</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Это устройство</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <Smartphone color={tokens.colors.accent.primary} size={24} />
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Tolk Android App</Text>
            <Text style={styles.sessionStatusActive}>В сети</Text>
            <Text style={styles.sessionDetails}>Moscow, RU</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.terminateButton} onPress={handleLogoutDevice}>
          <LogOut color={tokens.colors.status.error} size={20} />
          <Text style={styles.terminateButtonText}>Выйти на этом устройстве</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Другие устройства</Text>
        <TouchableOpacity style={styles.terminateAllButton} onPress={handleTerminateAll}>
          <Text style={styles.terminateAllText}>Завершить все другие сеансы</Text>
        </TouchableOpacity>

        {MOCK_SESSIONS.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionIcon}>
              <Monitor color={tokens.colors.text.secondary} size={24} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionStatusOffline}>Был(а) {session.time}</Text>
              <Text style={styles.sessionDetails}>{session.location}</Text>
            </View>
          </View>
        ))}

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
  sectionTitle: {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.sm,
    marginTop: tokens.spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.bg.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.sm,
    alignItems: 'center',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: 2,
  },
  sessionStatusActive: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.typography.sizes.sm,
    marginBottom: 2,
  },
  sessionStatusOffline: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    marginBottom: 2,
  },
  sessionDetails: {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.sizes.xs,
  },
  terminateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
  },
  terminateButtonText: {
    color: tokens.colors.status.error,
    fontSize: tokens.typography.sizes.md,
    marginLeft: tokens.spacing.sm,
  },
  terminateAllButton: {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.bg.surface,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.md,
    alignItems: 'center',
  },
  terminateAllText: {
    color: tokens.colors.status.error,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
    marginVertical: tokens.spacing.xl,
  },
});
