import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../store/appStore';
import { tokens } from '../theme/tokens';
import { Bell } from 'lucide-react-native';

export const EchoChip = () => {
  const pendingEchoes = useAppStore((state) => state.pendingEchoes);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pendingEchoes > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
        ),
        -1, // infinite
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [pendingEchoes, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (pendingEchoes === 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity style={styles.chip} onPress={() => {}}>
        <Bell color={tokens.colors.bg.primary} size={16} />
        <Text style={styles.text}>Echo &times;{pendingEchoes}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 100,
    elevation: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.accent.primary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    color: tokens.colors.bg.primary,
    fontWeight: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.sm,
    marginLeft: tokens.spacing.xs,
  },
});
