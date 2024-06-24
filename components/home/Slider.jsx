import React, { useRef, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const Slider = ({ sliderLists }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let newIndex = indexRef.current + 1;
      if (newIndex >= sliderLists.length) {
        newIndex = 0;
      }
      flatListRef.current.scrollToOffset({ offset: newIndex * width, animated: true });
      indexRef.current = newIndex;
    }, 4500); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [sliderLists.length]);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
      />
    </View>
  );

  // Pagination Indicator
  const PaginationIndicator = () => (
    <View style={styles.pagination}>
      {sliderLists.map((_, i) => {
        const opacity = scrollX.interpolate({
          inputRange: [
            (i - 1) * width,
            i * width,
            (i + 1) * width,
          ],
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return <Animated.View key={i.toString()} style={[styles.dot, { opacity }]} />;
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={sliderLists}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          indexRef.current = index;
        }}
      />
      <PaginationIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 200,
    position: 'relative',
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
});

export default Slider;
