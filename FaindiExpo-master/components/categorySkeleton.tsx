import { useEffect } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";

const CategoryItemSkeleton = () => {
  const circleAnimatedValue = new Animated.Value(0);

  const circleAnimated = () => {
    circleAnimatedValue.setValue(0);
    Animated.timing(circleAnimatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        circleAnimated();
      }, 1000);
    });
  };
  useEffect(() => {
    circleAnimated();
  }, []);

  const translateX3 = circleAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 90],
  });
  return (
    <View style={styles.itemContainer}>
      <View
        style={{
          marginBottom: 10,
          width: "100%",
          height: "100%",
          backgroundColor: "#ECEFF1",
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            width: "20%",
            height: "100%",
            backgroundColor: "white",
            opacity: 0.5,
            transform: [{ translateX: translateX3 }],
          }}
        ></Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: Dimensions.get("window").width / 4 - 20,
    height: Dimensions.get("window").width / 4 - 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginLeft: 10,
    marginRight: 10,
    padding: 5,
    borderRadius: 12,
  },
});

export default CategoryItemSkeleton;
