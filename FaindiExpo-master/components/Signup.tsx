import React from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import axios from "axios";
import { Text, View } from "./Themed";
import * as ImagePicker from "expo-image-picker";
import { uploadMedia } from "../utils/firebase";
import { convertApiUrl } from "../config";
import { useAuth } from "../hooks/AuthContext";
//@ts-ignore
import defaultAvatar from "../assets/images/users/default.png";

export default function SignUp({
  updateMode,
}: {
  updateMode: (mode: string) => void;
}) {
  const {updateVerifyEmail, updateVerifyToken} = useAuth();
  const [imgUploadLoading, setImgUploadLoading] = React.useState(false);
  const [avatar, setAvatar] = React.useState("");
  const [pAvatar, setPAvatar] = React.useState("");
  const [fullname, setFullname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [validUsername, setValidUsername] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [cpassword, setCPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const usernameChange = (_username: string) => {
    setUsername(_username);
  };

  const checkUsername = async () => {
    const response = await axios.post(convertApiUrl("auth/check-username"), {
      username,
    });

    if (response?.data?.result) {
      setValidUsername(true);
    } else {
      setValidUsername(false);
    }
  };

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (username !== "") {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [username]);

  const handleSignup = async () => {
    if (avatar === "") {
      ToastAndroid.show("Please Select Avatar Image!", ToastAndroid.SHORT);
      return;
    }

    if (fullname === "") {
      ToastAndroid.show("Please Input Fullname!", ToastAndroid.SHORT);
      return;
    }

    if (email === "") {
      ToastAndroid.show("Please Input Email Address!", ToastAndroid.SHORT);
      return;
    }
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(email) === false) {
      ToastAndroid.show("Please Input valid Email!", ToastAndroid.SHORT);
      return;
    }

    if (username === "") {
      ToastAndroid.show("Please Input Username!", ToastAndroid.SHORT);
      return;
    }

    if (username !== "" && !validUsername) {
      ToastAndroid.show("Please Input valid Username!", ToastAndroid.SHORT);
      return;
    }

    if (password === "") {
      ToastAndroid.show("Please Input Password!", ToastAndroid.SHORT);
      return;
    }

    if (password !== cpassword) {
      ToastAndroid.show("Password confirmation not match", ToastAndroid.SHORT);
      return;
    }

    const signupData = {
      avatar: avatar,
      fullname: fullname,
      email: email,
      username: username,
      password: password,
    };

    setLoading(true);

    try {
      const response = await axios.post(convertApiUrl("auth/signup"), signupData);

      if (response.data.token) {
        setLoading(false);
        ToastAndroid.show("You signed up successfully!", ToastAndroid.SHORT);
        setTimeout(() => {
          updateVerifyEmail(email)
          updateVerifyToken(response.data.token);
          updateMode("verify");
        }, 1000);
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error)
      if (error?.response.status === 400) {
        //@ts-ignore
        ToastAndroid.show(Object.values(error?.response.data)[0], ToastAndroid.SHORT);
      }
    }
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
        setImgUploadLoading(false);
        if (typeof avatarUrl === 'string') {
          setAvatar(avatarUrl);
        } else {
          ToastAndroid.show("Please Select Image Only!", ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show("Please Select Image Only!", ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show("You didn't selected image!", ToastAndroid.SHORT);
    }
  };

  return (
    <>
      <Text style={[styles.title]}>FAINDI</Text>
      <Text style={styles.subTitle}>Sign Up your account</Text>
      <View style={styles.formContainer}>
        <TouchableOpacity
          onPress={pickImageAsync}
          disabled={loading}
          style={{ position: "relative", width: 150, height: 150 }}
        >
          {imgUploadLoading && (
            <View style={styles.avatarUploadEffect}>
              <ActivityIndicator size={100} style={{}} color={"#fff"} />
            </View>
          )}
          <Image
            style={styles.avatarImg}
            source={pAvatar !== "" ? { uri: pAvatar } : defaultAvatar}
          />
        </TouchableOpacity>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            editable={!loading}
            placeholderTextColor="rgb(65,65,65)"
            style={styles.input}
            value={fullname}
            onChangeText={(_fullname) => setFullname(_fullname)}
            placeholder={"Full Name"}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            editable={!loading}
            placeholderTextColor="rgb(65,65,65)"
            style={styles.input}
            value={email}
            onChangeText={(_email) => setEmail(_email)}
            placeholder={"Email"}
          />
        </View>
        <View style={styles.formGroup}>
          <Text
            style={[
              styles.inputLabel,
              !validUsername && username !== "" && styles.error,
            ]}
          >
            Username
          </Text>
          <TextInput
            editable={!loading}
            placeholderTextColor="rgb(65,65,65)"
            style={[
              styles.input,
              !validUsername && username !== "" && styles.error,
            ]}
            value={username}
            onChangeText={(_username) => usernameChange(_username)}
            placeholder={"Username"}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            editable={!loading}
            placeholderTextColor="rgb(65,65,65)"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(password) => setPassword(password)}
            placeholder={"Password"}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Password Confirm</Text>
          <TextInput
            editable={!loading}
            placeholderTextColor="rgb(65,65,65)"
            secureTextEntry
            style={styles.input}
            value={cpassword}
            onChangeText={(_cpassword) => setCPassword(_cpassword)}
            placeholder={"Password Comfirmation"}
          />
        </View>
        <TouchableOpacity
          disabled={loading}
          style={styles.button}
          onPress={handleSignup}
        >
          {loading && (
            <ActivityIndicator
              size={28}
              style={{ marginRight: 10 }}
              color={"#fff"}
            />
          )}
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={loading}
          onPress={() => updateMode("login")}
        >
          <Text style={styles.tip}>
            You have account? <Text style={styles.tipSign}>Signin</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    paddingHorizontal: 70,
  },
  title: {
    fontSize: 42,
    color: "#edaeff",
  },
  subTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
  },
  formGroup: {
    width: "100%",
  },
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  avatarImg: {
    width: 150,
    height: 150,
    borderRadius: 10,
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
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 5,
    backgroundColor: "#edaeff",
    display: "flex",
    flexDirection: "row",
    height: 50,
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#fff",
  },
  tip: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  tipSign: {
    fontWeight: "bold",
    fontSize: 15,
    textDecorationStyle: "dashed",
    textDecorationColor: "#fff",
    textDecorationLine: "underline",
  },
  avatarUploadEffect: {
    opacity: 0.3,
    position: "absolute",
    zIndex: 1,
    width: 150,
    height: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "#ff4b4b",
    borderColor: "#ff4b4b",
  },
});
