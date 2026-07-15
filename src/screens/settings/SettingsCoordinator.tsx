import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useAppStore } from '../../store/appStore';
import { SettingsHub } from './SettingsHub';
import { AccountScreen } from './AccountScreen';
import { SessionsScreen } from './SessionsScreen';
import { BlockReportScreen } from './BlockReportScreen';

export const SettingsCoordinator = () => {
  const settingsRoute = useAppStore((state) => state.settingsRoute);
  const closeSettings = useAppStore((state) => state.closeSettings);

  const translateY = useSharedValue(1000); // Start off-screen

  useEffect(() => {
    if (settingsRoute !== null) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [settingsRoute]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (settingsRoute !== null) {
        if (settingsRoute === 'hub') {
          closeSettings();
        } else {
          useAppStore.getState().navigateSettings('hub');
        }
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [settingsRoute, closeSettings]);

  if (settingsRoute === null && translateY.value === 1000) {
    return null;
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const renderScreen = () => {
    switch (settingsRoute) {
      case 'hub':
        return <SettingsHub />;
      case 'account':
        return <AccountScreen />;
      case 'sessions':
        return <SessionsScreen />;
      case 'blocklist':
        return <BlockReportScreen />;
      default:
        // When transitioning out, settingsRoute might be null, but we still render what's there
        return <SettingsHub />;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {renderScreen()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
  },
});
