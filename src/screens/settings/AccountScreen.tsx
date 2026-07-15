import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Trash2 } from 'lucide-react-native';
import { useAppStore } from '../../store/appStore';
import { tokens } from '../../theme/tokens';

export const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const navigateSettings = useAppStore((state) => state.navigateSettings);
  const logout = useAppStore((state) => state.logout);

  const [name, setName] = useState('Nekach');
  const [username, setUsername] = useState('nekach');
  const [bio, setBio] = useState('');

  const handleDeleteAccount = () => {
    // In a real app, this would use a proper Dialog or bottom sheet if standard Alert isn't matching design.
    // For MVP, standard Alert to simulate multi-step confirm
    Alert.alert(
      'Удалить аккаунт?',
      'Это действие необратимо. Ваши сообщения у собеседников могут остаться.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            // Server: soft-delete -> hard job
            logout();
          }
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
        <Text style={styles.headerTitle}>Аккаунт</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name ? name[0] : '?'}</Text>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera color={tokens.colors.bg.primary} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Имя</Text>
          <TextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={tokens.colors.text.tertiary}
          />

          <Text style={styles.label}>Имя пользователя</Text>
          <TextInput 
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={tokens.colors.text.tertiary}
          />
          <Text style={styles.hint}>Уникальное имя для поиска</Text>

          <Text style={styles.label}>О себе</Text>
          <TextInput 
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="До 140 символов"
            multiline
            maxLength={140}
            placeholderTextColor={tokens.colors.text.tertiary}
          />
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 color={tokens.colors.status.error} size={20} />
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </TouchableOpacity>
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
    paddingBottom: tokens.spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: tokens.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: tokens.colors.bg.primary,
    fontSize: 36,
    fontWeight: tokens.typography.weights.bold,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: tokens.colors.text.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.bg.primary,
  },
  formSection: {
    marginBottom: tokens.spacing.xl,
  },
  label: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    marginBottom: tokens.spacing.xs,
    marginLeft: tokens.spacing.xs,
  },
  input: {
    backgroundColor: tokens.colors.bg.surface,
    color: tokens.colors.text.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.typography.sizes.md,
    marginBottom: tokens.spacing.sm,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.sizes.xs,
    marginBottom: tokens.spacing.md,
    marginLeft: tokens.spacing.xs,
  },
  dangerZone: {
    marginTop: tokens.spacing.xl,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  deleteButtonText: {
    color: tokens.colors.status.error,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semiBold,
    marginLeft: tokens.spacing.sm,
  },
});
