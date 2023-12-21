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
import { uploadMedia } from "../../../utils/firebase";
import { Text, View } from "../../../components/Themed";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/AuthContext";
import defaultCover from "../../../assets/images/cover/default.jpg";
import defaultAvatar from "../../../assets/images/users/default.png";
import { convertApiUrl } from "../../../config";
import { useProfile } from "../../../hooks/ProfileContext";

export default function Header() {
  const {
    cover,
    avatar,
    username,
    title,
    bio,
    fullName,
    updateAvatar,
    updateCover,
    authToken,
    logout,
    updateInfo
  } = useAuth();
  const {totalRate, totalFeedbackCount} =  useProfile()
  const [loading, setLoading] = React.useState(false);
  const [pAvatar, setPAvatar] = React.useState(avatar ? avatar : null);
  const [pCover, setPCover] = React.useState(cover ? cover : null);
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);
  const [imgUploadLoading, setImgUploadLoading] = React.useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = React.useState(false);
  const [_fullname, setFullname] = React.useState(fullName ? fullName : "");
  const [_username, setUsername] = React.useState(username ? username : "");
  const [validUsername, setValidUsername] = React.useState(true);
  const [_title, setTitle] = React.useState(title ? title : "");
  const [_bio, setBio] = React.useState(bio ? bio : "");

  const avatarUpdateFetch = async (newAvatar: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          convertApiUrl("profile/update/avatar"),
          { avatar: newAvatar },
          {
            headers: { "x-access-token": authToken },
          }
        );

        if (response.data.user) {
          resolve(true);
        }
      } catch (error: any) {
        reject(error);
      }
    });
  };

  const coverUpdateFetch = async (newCover: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          convertApiUrl("profile/update/cover"),
          { cover: newCover },
          {
            headers: { "x-access-token": authToken },
          }
        );

        if (response.data.user) {
          resolve(true);
        }
      } catch (error: any) {
        reject(error);
      }
    });
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      if (result.assets[0].type === "image") {
        setPAvatar(result.assets[0].uri);
        setImgUploadLoading(true);
        const avatarUrl = await uploadMedia("users", result.assets[0].uri);
        if (typeof avatarUrl === 'string') {
          await avatarUpdateFetch(avatarUrl);
          setImgUploadLoading(false);
          updateAvatar(avatarUrl);
          ToastAndroid.show("Avatar Image Updated!", ToastAndroid.SHORT);
        } else {
          // Handle the case where coverUrl is not a string
          ToastAndroid.show("Error uploading avatar image", ToastAndroid.SHORT);
        }
        
      } else {
        ToastAndroid.show("Please Select Image Only!", ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show("You didn't selected image!", ToastAndroid.SHORT);
    }
  };

  const toggleInfoModalOpen = () => {
    setInfoModalOpen((prev) => !prev);
  };

  const pickCoverImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 1],
    });

    if (!result.canceled) {
      if (result.assets[0].type === "image") {
        setPCover(result.assets[0].uri);
        setCoverUploadLoading(true);
        const coverUrl = await uploadMedia("covers", result.assets[0].uri);
        if (typeof coverUrl === 'string') {
          await coverUpdateFetch(coverUrl);
          setCoverUploadLoading(false);
          updateCover(coverUrl);
          ToastAndroid.show("Cover Image Updated!", ToastAndroid.SHORT);
        } else {
          // Handle the case where coverUrl is not a string
          ToastAndroid.show("Error uploading cover image", ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show("Please Select Image Only!", ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show("You didn't selected image!", ToastAndroid.SHORT);
    }
  };

  const handleClose = () => {
    setFullname(fullName);
    setUsername(username);
    setTitle(title);
    setBio(bio);
    setInfoModalOpen(false);
  };

  const handleInfoUpdate = async () => {
    if (_fullname === "") {
      ToastAndroid.show("Please Input Fullname!", ToastAndroid.SHORT);
      return;
    }

    if (_username === "") {
      ToastAndroid.show("Please Input Username!", ToastAndroid.SHORT);
      return;
    }

    if (_username !== "" && !validUsername) {
      ToastAndroid.show("Please Input valid Username!", ToastAndroid.SHORT);
      return;
    }

    const infoData = {
      fullname: _fullname,
      username: _username,
      title: _title,
      bio: _bio,
    };

    setLoading(true);

    try {
      const response = await axios.post(
        convertApiUrl("profile/update/info"),
        infoData,
        {
          headers: { "x-access-token": authToken },
        }
      );

      setLoading(false);

      if (response.data.success) {
        const updatedUser = response.data.user;
        updateInfo(updatedUser.fullname, updatedUser.username, updatedUser.title, updatedUser.bio);
        if (response.data.message !== "") {
          ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
        } else {
          ToastAndroid.show("Infomation updated successfully", ToastAndroid.SHORT);
        }
        setInfoModalOpen(false)
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      //@ts-ignore
      if (error?.response.status === 400) {
        //@ts-ignore
        ToastAndroid.show(Object.values(error?.response.data)[0],ToastAndroid.SHORT);
      } else if (error?.response.status === 401) {
        //@ts-ignore
        ToastAndroid.show("User Signed out",ToastAndroid.SHORT);
        logout()
      } else {
        //@ts-ignore
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  const checkUsername = async () => {
    setValidUsername(false);
    const response = await axios.post(convertApiUrl("auth/check-username"), {
      username: _username,
    });

    if (response?.data?.result) {
      setValidUsername(true);
    } else {
      setValidUsername(false);
    }
  };

  const bioCut = () => {
    const myBio = bio.replace(/[\n\r]+/g, ' ');
    if (myBio.length > 130) {
      return myBio.slice(0, 120)+"..."
    }
    return myBio
  }

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (_username !== username && _username !== "") {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [_username]);

  React.useEffect(() => {
    setPAvatar(avatar? avatar: null)
    setPCover(cover? cover: null)
  }, [cover, avatar])

  return (
    <>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={pCover ? { uri: pCover } : defaultCover}
          resizeMode="cover"
          style={styles.headerTopContainer}
        >
          <TouchableOpacity
            style={styles.headerCoverUpdateBtn}
            onPress={pickCoverImageAsync}
          >
            {coverUploadLoading ? (
              <ActivityIndicator size={20} style={{}} color={"#fff"} />
            ) : (
              <MaterialCommunityIcons
                name="image-edit"
                size={24}
                color="#fff"
              />
            )}
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.profileTitle}>my store</Text>
          </View>
        </ImageBackground>
        <View style={styles.detailContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
              <TouchableOpacity onPress={pickImageAsync}>
                {imgUploadLoading && (
                  <View style={styles.avatarUploadEffect}>
                    <ActivityIndicator size={50} style={{}} color={"#fff"} />
                  </View>
                )}
                <Image
                  style={styles.avatarImg}
                  source={pAvatar !== "" ? { uri: pAvatar } : defaultAvatar}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.usernameRateBox}>
              <TouchableOpacity style={{ flex: 1 }} onPress={toggleInfoModalOpen}>
                <Text style={styles.usernameText}>
                  {username ? "@" + username : ""}
                </Text>
              </TouchableOpacity>
              <View style={styles.rateBox}>
                <AntDesign name={totalRate>=1? "star": "staro"} size={16} color="white" />
                <AntDesign name={totalRate>=2? "star": "staro"} size={16} color="white" />
                <AntDesign name={totalRate>=3? "star": "staro"} size={16} color="white" />
                <AntDesign name={totalRate>=4? "star": "staro"} size={16} color="white" />
                <AntDesign name={totalRate>=5? "star": "staro"} size={16} color="white" />
                <Text style={{ marginLeft: 3 }}>({totalFeedbackCount})</Text>
              </View>
            </View>
            <View style={styles.userTitleBioBox}>
              <TouchableOpacity onPress={toggleInfoModalOpen}>
                <Text style={{ fontSize: 13, marginBottom: 5 }}>
                  {title ? title : "No Handled Yet"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleInfoModalOpen}>
                <Text style={{ fontSize: 12}}>
                  {bio ? bioCut() : "No Handled Yet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={infoModalOpen}>
        <ScrollView
          contentContainerStyle={{
            width: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.modalContainer}>
            <Pressable onPress={handleClose} style={styles.modalOverlay}>
              <View style={styles.modalOverlay}></View>
            </Pressable>

            <View style={styles.modalContent}>
              <Text
                style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}
              >
                Update your Infomations
              </Text>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  editable={!loading}
                  placeholderTextColor="rgb(65,65,65)"
                  style={styles.input}
                  value={_fullname}
                  onChangeText={(__fullname) => setFullname(__fullname)}
                  placeholder={"Full Name"}
                />
              </View>
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    !validUsername && _username !== username && styles.error,
                  ]}
                >
                  Username
                </Text>
                <TextInput
                  editable={!loading}
                  placeholderTextColor="rgb(65,65,65)"
                  style={[
                    styles.input,
                    !validUsername && _username !== username && styles.error,
                  ]}
                  value={_username}
                  onChangeText={(__username) => setUsername(__username)}
                  placeholder={"Username"}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  editable={!loading}
                  placeholderTextColor="rgb(65,65,65)"
                  style={styles.input}
                  value={_title}
                  onChangeText={(__title) => setTitle(__title)}
                  placeholder={"Title"}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  placeholderTextColor="rgb(65,65,65)"
                  style={styles.inputArea}
                  value={_bio}
                  onChangeText={(__bio) => setBio(__bio)}
                  placeholder={"Bio"}
                  multiline={true}
                  numberOfLines={5}
                />
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  disabled={loading}
                  onPress={handleClose}
                  style={[styles.button, styles.redButton]}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleInfoUpdate}
                  disabled={loading}
                  style={styles.button}
                >
                  {loading && (
                    <ActivityIndicator
                      size={28}
                      style={{ marginRight: 10 }}
                      color={"#fff"}
                    />
                  )}
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </>
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
    paddingBottom:  5,
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
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "#edaeff",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
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
    overflow: 'hidden'
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
});
