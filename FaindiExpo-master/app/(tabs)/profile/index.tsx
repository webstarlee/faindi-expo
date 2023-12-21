import React from "react";
import { StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Text, View } from "../../../components/Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/AuthContext";
import AuthModal from "../../../components/AuthModal";
import Header from "./header";
import { ScrollView } from "react-native-gesture-handler";
import ProductsPage from "./procuts";
import LikesPage from "./likes";
import RecyclesPage from "./recycles";
import OrdersPage from "./orders";
import ReviewsPage from "./reviews";

export default function TabProfileScreen() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = React.useState(1);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerMargin = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [0, -220],
    extrapolate: "clamp",
  });

  const scrollviewMargmin = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [270, 50],
    extrapolate: "clamp",
  });

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          <Animated.View style={[styles.header, { marginTop: headerMargin }]}>
            <Header />
            <View style={styles.profileTabBarContainer}>
              <TouchableOpacity onPress={() => setCurrentTab(1)}>
                <MaterialCommunityIcons
                  name="view-dashboard-outline"
                  size={32}
                  color={currentTab === 1 ? "#edaeff" : "#fff"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTab(2)}>
                <AntDesign name="hearto" size={30} color={currentTab === 2 ? "#edaeff" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTab(3)}>
                <Fontisto name="recycle" size={30} color={currentTab === 3 ? "#edaeff" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTab(4)}>
                <Feather name="check-circle" size={30} color={currentTab === 4 ? "#edaeff" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTab(5)}>
                <AntDesign name="staro" size={34} color={currentTab === 5 ? "#edaeff" : "#fff"} />
              </TouchableOpacity>
            </View>
          </Animated.View>
          <ScrollView
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            contentContainerStyle={{ width: "100%", }}
            style={[styles.scrollViewContent]}
          >
            {currentTab === 1 && <ProductsPage />}
            {currentTab === 2 && <LikesPage />}
            {currentTab === 3 && <RecyclesPage />}
            {currentTab === 4 && <OrdersPage />}
            {currentTab === 5 && <ReviewsPage />}
          </ScrollView>
        </View>
      ) : (
        <AuthModal />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  scrollViewContent: {
    width: "100%",
    flex: 1
  },
  header: {
    backgroundColor: "#03A9F4",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileTabBarContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#000",
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  profileTabBtn: {
    height: "100%",
    flex: 1,
  },
});
