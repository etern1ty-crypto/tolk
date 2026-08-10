import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';

type AuthMode = 'login' | 'register';

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const authLoading = useAppStore((state) => state.authLoading);
  const authError = useAppStore((state) => state.authError);
  const clearAuthError = useAppStore((state) => state.clearAuthError);

  const handleSubmit = async () => {
    clearAuthError();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearAuthError();
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const isFormValid = () => {
    if (mode === 'login') {
      return email.length > 0 && password.length > 0;
    }
    return username.length >= 3 && email.includes('@') && password.length >= 6;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.title}>Tolk</Text>
          <Text style={styles.subtitle}>Minimalist Messenger</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => switchMode('login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => switchMode('register')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!authLoading}
                />
                {username.length > 0 && username.length < 3 && (
                  <Text style={styles.hintText}>Username must be at least 3 characters</Text>
                )}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={tokens.colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!authLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!authLoading}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {mode === 'register' && password.length > 0 && password.length < 6 && (
                <Text style={styles.hintText}>Password must be at least 6 characters</Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid() || authLoading}
            activeOpacity={0.8}
          >
            {authLoading ? (
              <ActivityIndicator color={tokens.colors.bg.primary} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={styles.footerLink}>
                {mode === 'login' ? 'Register' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>v1.0.0 • Expo SDK 57</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: tokens.spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.bg.primary,
  },
  title: {
    fontSize: tokens.typography.sizes.h1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.text.secondary,
  },
  card: {
    backgroundColor: tokens.colors.bg.secondary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.bg.primary,
    borderRadius: tokens.radius.md,
    padding: 4,
    marginBottom: tokens.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
  },
  activeTab: {
    backgroundColor: tokens.colors.accent.primary,
  },
  tabText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
  },
  activeTabText: {
    color: tokens.colors.bg.primary,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.spacing.md,
  },
  errorText: {
    color: '#ef4444',
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
  },
  formContainer: {
    gap: tokens.spacing.md,
  },
  inputGroup: {
    gap: tokens.spacing.xs,
  },
  label: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  input: {
    backgroundColor: tokens.colors.bg.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm + 2,
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.text.primary,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: 'absolute',
    right: tokens.spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordText: {
    color: tokens.colors.accent.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
  },
  hintText: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.tertiary,
  },
  submitButton: {
    backgroundColor: tokens.colors.accent.primary,
    paddingVertical: tokens.spacing.md + 2,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: tokens.colors.bg.primary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
  },
  footerText: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.text.secondary,
  },
  footerLink: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.accent.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
  versionText: {
    textAlign: 'center',
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.spacing.xl,
  },
});
