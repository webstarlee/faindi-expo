import React from "react";
import { useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import axios from "axios";
import { View } from "../../../../components/Themed";
import UserHeader from "./userHeader";
import UserProductsPage from "./userProducts";
import UserFeedbacksPage from "./userFeedbacks";
import UserRecyclesPage from "./userRecycles";
import {
  UserProps,
  ProductProps,
  ProfileFeedbackProps,
} from "../../../../hooks/types";
import { convertApiUrl } from "../../../../config";

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [user, setUser] = React.useState<UserProps | null>(null);
  const [isFetch, setIsFetch] = React.useState(false);
  const [products, setProducts] = React.useState<ProductProps[] | []>([]);
  const [feedbacks, setFeedbacks] = React.useState<ProfileFeedbackProps[] | []>([]);
  const [currentTab, setCurrentTab] = React.useState(1);
  const [rate, setRate] = React.useState(0);
  const [rateCount, setRateCount] = React.useState(0);
  const headerMargin = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [0, -220],
    extrapolate: "clamp",
  });

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(convertApiUrl(`user/items/${id}`));
      if (response.status === 200) {
        setUser(response.data.user);
        setProducts(response.data.user_products);
        setFeedbacks(response.data.feedbacks);
        setRate(response.data.total_rate);
        setRateCount(response.data.total_feedback_count);
      }
      setIsFetch(true);
    } catch (error: any) {
      setIsFetch(true);
    }
  };

  React.useEffect(() => {
    if (id && user === null) {
      fetchUserDetails();
    }
  }, [id, user]);

  return (
    <View style={styles.container}>
      {isFetch && user ? (
        <>
        <Animated.View style={[styles.header, { marginTop: headerMargin }]}>
          <UserHeader
            products={products}
            user={user}
            totalRate={rate}
            rateCount={rateCount}
          />
          <View style={styles.profileTabBarContainer}>
            <TouchableOpacity onPress={() => setCurrentTab(1)}>
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={32}
                color={currentTab === 1 ? "#edaeff" : "#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentTab(2)}>
              <Fontisto
                name="recycle"
                size={30}
                color={currentTab === 2 ? "#edaeff" : "#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentTab(3)}>
              <AntDesign
                name="staro"
                size={34}
                color={currentTab === 3 ? "#edaeff" : "#fff"}
              />
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
            {(currentTab === 1) && <UserProductsPage products={products} />}
            {(currentTab === 2) && <UserRecyclesPage products={products} />}
            {(currentTab === 3) && <UserFeedbacksPage feedbacks={feedbacks} />}
          </ScrollView>
        </>
      ) : (
        <ActivityIndicator size={100} color={"#fff"} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    backgroundColor: "#03A9F4",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  scrollViewContent: {
    width: "100%",
    flex: 1
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
