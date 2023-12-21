import React from "react";
import {
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { Text, View } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import AuthModal from "../../../components/AuthModal";
import faindiLogoImg from "../../../assets/images/faindi_logo.png";
import CartBtn from "../../../components/CartBtn";
import tempAvatar from "../../../assets/images/users/default.png";
import { useProfile } from "../../../hooks/ProfileContext";
import { FollowingProps } from "../../../hooks/types";
import { convertApiUrl } from "../../../config";
import { getCurrencySymbol } from "../../../utils/common";

export default function TabPeopleScreen() {
  const { isAuthenticated, authToken } = useAuth();
  const { followings } = useProfile();
  const navigation = useRouter();
  const [isFetch, setIsFetch] = React.useState(false);
  const [newUsers, setNewUsers] = React.useState<FollowingProps[] | []>([]);

  const makeFollowingChunk = () => {
    var myArray = [];
    if (followings.length > 0) {
      for (var i = 0; i < followings.length; i += 3) {
        myArray.push(followings.slice(i, i + 3));
      }
    }
    return myArray;
  };

  const fetchNewUsers = async () => {
    try {
      const response = await axios.get(convertApiUrl(`user/new-users`), {
        headers: { "x-access-token": authToken },
      });
      if (response.status === 200) {
        setNewUsers(response.data.new_users);
      }
      setIsFetch(true);
    } catch (error: any) {
      setIsFetch(true);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && !isFetch && newUsers.length === 0) {
      fetchNewUsers();
    }
  }, [isAuthenticated, authToken]);

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.faindiImgBox}>
              <Image style={styles.faindiLogoImg} source={faindiLogoImg} />
            </View>
            <View style={styles.cartBtnBox}>
              <CartBtn />
            </View>
          </View>
          <ScrollView style={{ width: "100%", paddingTop: 20 }}>
            <Text style={styles.newTitle}>Find Something new:</Text>
            {newUsers.length > 0 ? (
              <ScrollView
                horizontal={true}
                contentContainerStyle={{
                  paddingVertical: 30,
                  paddingHorizontal: 10,
                }}
              >
                {newUsers.map((newUser, index) => {
                  if (newUser.topProduct) {
                    return (
                      <Pressable
                        onPress={() =>
                          navigation.push(
                            `/home/product/${newUser?.topProduct?._id}`
                          )
                        }
                        key={index}
                        style={styles.horisontalProductContainer}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.push(
                              `/peoples/user/${newUser?.user?._id}`
                            )
                          }
                          style={styles.avatarImgBtn}
                        >
                          <Image
                            style={styles.avatarImg}
                            source={
                              newUser.user
                                ? { uri: newUser.user.avatar }
                                : tempAvatar
                            }
                          />
                        </TouchableOpacity>
                        <View style={styles.likeBox}>
                          <AntDesign
                            style={styles.likeHeart}
                            name="heart"
                            size={36}
                            color="white"
                          />
                          <AntDesign
                            style={[styles.likeHeart, { opacity: 0.3 }]}
                            name="hearto"
                            size={36}
                            color="#0f0f0f"
                          />
                          <Text style={styles.likeTxt}>
                            {newUser.topProduct
                              ? newUser.topProduct.likes.length
                              : 0}
                          </Text>
                        </View>
                        {newUser.topProduct &&
                          newUser.topProduct.medias[0].media_type ===
                            "image" && (
                            <Image
                              style={styles.productImg}
                              source={{
                                uri: newUser.topProduct.medias[0].uri,
                              }}
                            />
                          )}
                        {newUser.topProduct &&
                          newUser.topProduct.medias[0].media_type ===
                            "video" && (
                            <Video
                              style={styles.video}
                              source={{
                                uri: newUser.topProduct.medias[0].uri,
                              }}
                              shouldPlay
                              useNativeControls
                              resizeMode={ResizeMode.CONTAIN}
                              isLooping
                            />
                          )}
                        <Text style={styles.productTitle}>
                          {newUser.topProduct ? newUser.topProduct.title : ""}
                        </Text>
                        <Text style={styles.productPrice}>
                          €{newUser.topProduct ? newUser.topProduct.price : 0}
                        </Text>
                      </Pressable>
                    );
                  } else {
                    return (
                      <Pressable
                        key={index}
                        style={styles.horisontalProductContainer}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.push(
                              `/peoples/user/${newUser?.user?._id}`
                            )
                          }
                          style={styles.avatarImgBtn}
                        >
                          <Image
                            style={styles.avatarImg}
                            source={
                              newUser.user
                                ? { uri: newUser.user.avatar }
                                : tempAvatar
                            }
                          />
                        </TouchableOpacity>
                        <View style={styles.noProductBox}>
                          <Text>No product</Text>
                        </View>
                      </Pressable>
                    );
                  }
                })}
              </ScrollView>
            ) : (
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                New User Not found
              </Text>
            )}
            <Text style={styles.followTitle}>
              Recent Listings from{"\n"}people you follow:
            </Text>
            {followings.length > 0 ? (
              makeFollowingChunk().map((followings, index) => {
                return (
                  <View key={index} style={styles.followingContainer}>
                    {followings.map((following, _index) => {
                      if (following.topProduct) {
                        return (
                          <Pressable
                            onPress={() =>
                              navigation.push(
                                `/home/product/${following?.topProduct?._id}`
                              )
                            }
                            key={_index}
                            style={styles.productContainer}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                navigation.push(
                                  `/peoples/user/${following?.user?._id}`
                                )
                              }
                              style={styles.avatarImgBtn}
                            >
                              <Image
                                style={styles.avatarImg}
                                source={
                                  following.user
                                    ? { uri: following.user.avatar }
                                    : tempAvatar
                                }
                              />
                            </TouchableOpacity>
                            <View style={styles.likeBox}>
                              <AntDesign
                                style={styles.likeHeart}
                                name="heart"
                                size={36}
                                color="white"
                              />
                              <AntDesign
                                style={[styles.likeHeart, { opacity: 0.3 }]}
                                name="hearto"
                                size={36}
                                color="#0f0f0f"
                              />
                              <Text style={styles.likeTxt}>
                                {following.topProduct
                                  ? following.topProduct.likes.length
                                  : 0}
                              </Text>
                            </View>
                            {following.topProduct &&
                              following.topProduct.medias[0].media_type ===
                                "image" && (
                                <Image
                                  style={styles.productImg}
                                  source={{
                                    uri: following.topProduct.medias[0].uri,
                                  }}
                                />
                              )}
                            {following.topProduct &&
                              following.topProduct.medias[0].media_type ===
                                "video" && (
                                <Video
                                  style={styles.video}
                                  source={{
                                    uri: following.topProduct.medias[0].uri,
                                  }}
                                  shouldPlay
                                  useNativeControls
                                  resizeMode={ResizeMode.CONTAIN}
                                  isLooping
                                />
                              )}
                            <Text style={styles.productTitle}>
                              {following.topProduct
                                ? following.topProduct.title
                                : ""}
                            </Text>
                            <Text style={styles.productPrice}>
                              {getCurrencySymbol(following.topProduct.currency)}
                              {following.topProduct
                                ? following.topProduct.price
                                : 0}
                            </Text>
                          </Pressable>
                        );
                      } else {
                        return (
                          <Pressable
                            key={_index}
                            style={styles.productContainer}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                navigation.push(
                                  `/peoples/user/${following?.user?._id}`
                                )
                              }
                              style={styles.avatarImgBtn}
                            >
                              <Image
                                style={styles.avatarImg}
                                source={
                                  following.user
                                    ? { uri: following.user.avatar }
                                    : tempAvatar
                                }
                              />
                            </TouchableOpacity>
                            <View style={styles.noProductBox}>
                              <Text>No product</Text>
                            </View>
                          </Pressable>
                        );
                      }
                    })}
                    {followings.length === 2 && (
                      <View style={styles.fakeProductContainer}></View>
                    )}
                    {followings.length === 1 && (
                      <>
                        <View style={styles.fakeProductContainer}></View>
                        <View style={styles.fakeProductContainer}></View>
                      </>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={{ textAlign: "center" }}>
                You don't have followings.
              </Text>
            )}
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
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
  },
  faindiImgBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  faindiLogoImg: {
    width: 120,
    resizeMode: "contain",
  },
  cartBtnBox: {
    position: "absolute",
    top: -10,
    right: 10,
  },
  newTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    color: "#edaeff",
    textTransform: "uppercase",
    textAlign: "center",
  },
  followTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 40,
    marginTop: 20,
    color: "#fff",
    textTransform: "uppercase",
    textAlign: "center",
  },
  horisontalProductContainer: {
    width: ((Dimensions.get("window").width - 30) * 30) / 100,
    backgroundColor: "#fff",
    padding: 5,
    position: "relative",
    marginHorizontal: (Dimensions.get("window").width * 10) / 100 / 6,
  },
  productTitle: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 3,
  },
  productPrice: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  likeBox: {
    position: "absolute",
    width: 34,
    height: 30,
    backgroundColor: "transparent",
    top: 5,
    right: 6,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  likeHeart: {
    position: "absolute",
    top: -2,
    left: -1,
    opacity: 0.8,
  },
  likeTxt: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  productImg: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 40,
    resizeMode: "cover",
  },
  avatarImgBtn: {
    position: "absolute",
    zIndex: 1,
    top: -25,
    left: -10,
    borderRadius: 30,
    overflow: "hidden",
  },
  avatarImg: {
    width: 60,
    height: 60,
  },
  productContainer: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 5,
    position: "relative",
  },
  followingContainer: {
    paddingHorizontal: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  fakeProductContainer: {
    width: "30%",
    backgroundColor: "transparent",
    padding: 5,
    position: "relative",
  },
  video: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 40,
  },
  noProductBox: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
});
