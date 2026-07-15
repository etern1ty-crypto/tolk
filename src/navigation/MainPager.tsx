import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3 columns: ChatList (0), Chat (1), ChatWall (2)
const COLUMNS = 3;
const MAX_TRANSLATE = -(COLUMNS - 1) * SCREEN_WIDTH;

export const springConfig = {
  mass: 1,
  damping: 20,
  stiffness: 250,
};

interface MainPagerProps {
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  renderList: () => React.ReactNode;
  renderChat: () => React.ReactNode;
  renderWall: () => React.ReactNode;
  currentIndex: number;
}

export const MainPager: React.FC<MainPagerProps> = ({
  initialIndex = 0,
  onIndexChange,
  renderList,
  renderChat,
  renderWall,
  currentIndex,
}) => {
  const translateX = useSharedValue(-initialIndex * SCREEN_WIDTH);
  const context = useSharedValue({ x: 0 });

  // Sync external index changes
  React.useEffect(() => {
    translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, springConfig);
  }, [currentIndex, translateX]);

  const snapToIndex = (index: number) => {
    'worklet';
    const targetX = -index * SCREEN_WIDTH;
    translateX.value = withSpring(targetX, springConfig, (finished) => {
      if (finished && onIndexChange) {
        runOnJS(onIndexChange)(index);
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      let newTranslate = context.value.x + event.translationX;
      // Overscroll resistance
      if (newTranslate > 0) {
        newTranslate = newTranslate / 3;
      } else if (newTranslate < MAX_TRANSLATE) {
        newTranslate = MAX_TRANSLATE + (newTranslate - MAX_TRANSLATE) / 3;
      }
      translateX.value = newTranslate;
    })
    .onEnd((event) => {
      // Thresholds: 40% width or 800px/s velocity
      const swipeThreshold = SCREEN_WIDTH * 0.4;
      const velocityThreshold = 800;

      const currentPositionX = translateX.value;
      const projectedPosition = currentPositionX + (event.velocityX * 0.2); // look ahead

      let targetIndex = Math.round(-currentPositionX / SCREEN_WIDTH);

      if (event.velocityX > velocityThreshold || event.translationX > swipeThreshold) {
        // swipe right -> index decreases
        targetIndex = Math.max(0, targetIndex - 1);
      } else if (event.velocityX < -velocityThreshold || event.translationX < -swipeThreshold) {
        // swipe left -> index increases
        targetIndex = Math.min(COLUMNS - 1, targetIndex + 1);
      }

      snapToIndex(targetIndex);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.page}>{renderList()}</View>
        <View style={styles.page}>{renderChat()}</View>
        <View style={styles.page}>{renderWall()}</View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * COLUMNS,
  },
  page: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});
