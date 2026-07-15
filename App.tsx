import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from './src/store/appStore';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatWallScreen } from './src/screens/ChatWallScreen';
import { MainPager } from './src/navigation/MainPager';
import { EchoChip } from './src/components/EchoChip';
import { SettingsCoordinator } from './src/screens/settings/SettingsCoordinator';
import { OfflineBanner } from './src/components/OfflineBanner';
import { StyleSheet, View } from 'react-native';
import { tokens } from './src/theme/tokens';

export default function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const activeChatId = useAppStore((state) => state.activeChatId);
  const [pagerIndex, setPagerIndex] = useState(0);

  // If a chat is selected, move pager to index 1
  useEffect(() => {
    if (activeChatId && pagerIndex === 0) {
      setPagerIndex(1);
    } else if (!activeChatId && pagerIndex !== 0) {
      setPagerIndex(0);
    }
  }, [activeChatId]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        {!isAuthenticated ? (
          <AuthScreen />
        ) : (
          <View style={styles.container}>
            <OfflineBanner />
            <EchoChip />
            <MainPager
              currentIndex={pagerIndex}
              onIndexChange={(index) => {
                setPagerIndex(index);
                // If user swipes back to index 0, clear active chat
                if (index === 0 && activeChatId) {
                  useAppStore.getState().setActiveChat(null);
                }
              }}
              renderList={() => <ChatListScreen />}
              renderChat={() => <ChatScreen />}
              renderWall={() => <ChatWallScreen jumpToChat={() => setPagerIndex(1)} />}
            />
            <SettingsCoordinator />
          </View>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
});
