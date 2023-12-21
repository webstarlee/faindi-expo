import React from "react";
import axios from "axios";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadMedia } from "../../../../utils/firebase";
import { Text, View } from "../../../../components/Themed";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../../../hooks/AuthContext";
import defaultCover from "../../../../assets/images/cover/default.jpg";
import defaultAvatar from "../../../../assets/images/users/default.png";
import { convertApiUrl } from "../../../../config";
import { useProfile } from "../../../../hooks/ProfileContext";
import { UserProps, ProductProps } from "../../../../hooks/types";

interface UserHeaderProps {
  user: UserProps | null;
  totalRate: number | 0;
  rateCount: number | 0;
  products: ProductProps[] | [];
}

export default function UserHeader(props: UserHeaderProps) {
  const { user, totalRate, rateCount, products } = props;
  const { authToken, isAuthenticated } = useAuth();

  const { followings, addFollowing, removeFollowing } = useProfile();

  const bioCut = () => {
    let myBio = "No handled yet";
    if (user) {
      myBio = user.bio.replace(/[\n\r]+/g, " ");
      if (myBio.length > 130) {
        return myBio.slice(0, 120) + "...";
      }
    }
    return myBio;
  };

  const handleFollowBtn = async () => {
    if (user) {
      const newFollowing = {
        user: user,
        topProduct: products[0],
      };
      addFollowing(newFollowing);
      try {
        const response = await axios.get(
          convertApiUrl(`user/follow/${user._id}`),
          {
            headers: { "x-access-token": authToken },
          }
        );

        if (response.status === 200) {
          ToastAndroid.show(`Following ${user.fullname}`, ToastAndroid.SHORT);
        }
      } catch (error: any) {
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  const handleUnFollowBtn = async () => {
    if (user) {
      removeFollowing(user._id);
      try {
        const response = await axios.get(
          convertApiUrl(`user/unfollow/${user._id}`),
          {
            headers: { "x-access-token": authToken },
          }
        );

        if (response.status === 200) {
          ToastAndroid.show(
            `You are not following ${user.fullname}`,
            ToastAndroid.SHORT
          );
        }
      } catch (error: any) {
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  const checkIsFollowing = () => {
    if (followings.length > 0 && user) {
      const currentFollows = followings.filter(
        (follow) => follow.user._id.toString() === user?._id?.toString()
      );
      if (currentFollows.length > 0) {
        return true;
      }
    }
    return false;
  };

  return (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={user?.cover ? { uri: user?.cover } : defaultCover}
        resizeMode="cover"
        style={styles.headerTopContainer}
      >
        <View style={styles.headerTitleBox}>
          <Text style={styles.profileTitle}>
            {user?.fullname ? user?.fullname : "No handled yet"}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.detailContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBox}>
            <Image
              style={styles.avatarImg}
              source={user?.avatar ? { uri: user?.avatar } : defaultAvatar}
            />
            {isAuthenticated && (
              <>
                {!checkIsFollowing() ? (
                  <TouchableOpacity
                    onPress={handleFollowBtn}
                    style={styles.userFollowBtn}
                  >
                    <Feather name="plus" size={24} color="black" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleUnFollowBtn}
                    style={styles.userUnFollowBtn}
                  >
                    <AntDesign name="check" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.usernameRateBox}>
            <Text style={styles.usernameText}>
              {user?.username ? "@" + user?.username : "No handled yet"}
            </Text>
            <View style={styles.rateBox}>
              <AntDesign
                name={totalRate >= 1 ? "star" : "staro"}
                size={16}
                color="white"
              />
              <AntDesign
                name={totalRate >= 2 ? "star" : "staro"}
                size={16}
                color="white"
              />
              <AntDesign
                name={totalRate >= 3 ? "star" : "staro"}
                size={16}
                color="white"
              />
              <AntDesign
                name={totalRate >= 4 ? "star" : "staro"}
                size={16}
                color="white"
              />
              <AntDesign
                name={totalRate >= 5 ? "star" : "staro"}
                size={16}
                color="white"
              />
              <Text style={{ marginLeft: 3 }}>({rateCount})</Text>
            </View>
          </View>
          <View style={styles.userTitleBioBox}>
            <Text style={{ fontSize: 13, marginBottom: 5 }}>
              {user?.title ? user?.title : "No Handled Yet"}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {user?.bio ? bioCut() : "No Handled Yet"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "#ddd",
  },
  headerTopContainer: {
    width: "100%",
    position: "relative",
  },
  headerCoverImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  headerTopToolBox: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 10,
  },
  profileTitle: {
    fontSize: 50,
    color: "#edaeff",
    fontFamily: "Baumans",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerTitleBox: {
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 30,
  },
  detailContainer: {
    display: "flex",
    flexDirection: "row",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    borderStyle: "solid",
    paddingBottom: 5,
  },
  avatarContainer: {
    width: 110,
    paddingLeft: 20,
  },
  avatarBox: {
    width: 90,
    height: 90,
    marginTop: -40,
    borderRadius: 50,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  contentContainer: {
    flex: 1,
  },
  usernameRateBox: {
    paddingTop: 10,
    paddingBottom: 5,
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  usernameText: {
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
  },
  rateBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  userTitleBioBox: {
    paddingRight: 10,
    paddingBottom: 10,
    height: 70,
    overflow: "hidden",
  },
  avatarUploadEffect: {
    opacity: 0.5,
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCoverUpdateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#edaeff",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bottom: 5,
    right: 5,
    zIndex: 1,
  },
  modalContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    backgroundColor: "#fff",
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    left: 0,
    top: 0,
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  formGroup: {
    width: "100%",
    marginTop: 5,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "solid",
    borderRadius: 3,
    fontSize: 18,
  },
  inputArea: {
    display: "flex",
    width: "100%",
    height: 150,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    fontSize: 18,
    textAlignVertical: "top",
  },
  buttonGroup: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 5,
    backgroundColor: "#edaeff",
    display: "flex",
    flexDirection: "row",
    height: 40,
    marginTop: 10,
    width: "47%",
  },
  redButton: {
    backgroundColor: "#ff4b4b",
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#fff",
  },
  error: {
    color: "#ff4b4b",
    borderColor: "#ff4b4b",
  },
  userFollowBtn: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "#edaeff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    bottom: -10,
  },
  userUnFollowBtn: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "#e1ffba",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    bottom: -10,
  },
});
