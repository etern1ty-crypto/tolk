import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';

export const AuthScreen = () => {
  const login = useAppStore((state) => state.login);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tolk</Text>
      <Text style={styles.subtitle}>Minimalist Messenger</Text>
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Log In (Mock)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.typography.sizes.h1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xxl,
  },
  button: {
    backgroundColor: tokens.colors.accent.primary,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.pill,
  },
  buttonText: {
    color: tokens.colors.bg.primary,
    fontWeight: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.md,
  },
});
