import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';
import { WifiOff } from 'lucide-react-native';

export const OfflineBanner = () => {
  const isOffline = useAppStore((state) => state.isOffline);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (isOffline) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { paddingTop: insets.top || tokens.spacing.md },
        animatedStyle
      ]}
      pointerEvents="none"
      accessibilityRole="alert"
    >
      <View style={styles.banner}>
        <WifiOff color={tokens.colors.bg.primary} size={16} />
        <Text style={styles.text}>Ожидание сети...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.text.secondary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: tokens.spacing.sm,
  },
  text: {
    color: tokens.colors.bg.primary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    marginLeft: tokens.spacing.sm,
  },
});
