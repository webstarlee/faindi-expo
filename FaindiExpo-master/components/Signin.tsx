import React from "react";
import {
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { convertApiUrl } from "../config";
import { Text, View } from "./Themed";
import { useAuth } from "../hooks/AuthContext";

export default function Signin({ updateMode }: { updateMode: (mode: string) => void }) {
  const {updateVerifyEmail, updateVerifyToken, login} = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSignin = async () => {
    if (email === "") {
      ToastAndroid.show("Please Input Email Address!", ToastAndroid.SHORT);
      return;
    }

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(email) === false) {
      ToastAndroid.show("Please Input valid Email!", ToastAndroid.SHORT);
      return;
    }

    if (password === "") {
      ToastAndroid.show("Please Input Password!", ToastAndroid.SHORT);
      return;
    }

    const signinData = {
      email: email,
      password: password,
    };

    setLoading(true);

    try {
      const response = await axios.post(convertApiUrl("auth/signin"), signinData);
      setLoading(false);
      ToastAndroid.show("Signed In successfully", ToastAndroid.SHORT);
      const user = response.data.user;
      const accessToken = response.data.accessToken;
      login(user.user_id, user.fullname, user.email, user.username, user.avatar, "", accessToken, user.title, user.bio)
    } catch (error: any) {
      setLoading(false);
      if (error?.response.status === 401) {
        ToastAndroid.show("Invalid credentidal", ToastAndroid.SHORT);
      } else if (error?.response.status === 403) {
        ToastAndroid.show("Need to Email Verify", ToastAndroid.SHORT);
        console.log(error?.response?.data)
        updateVerifyEmail(error?.response.data.email)
        updateVerifyToken(error?.response.data.token);
        updateMode("verify");
      } else {
        ToastAndroid.show("Server error", ToastAndroid.SHORT);
      }
    }
  };

  return (
    <>
      <Text style={styles.title}>FAINDI</Text>
      <Text style={styles.subTitle}>Sign in your account</Text>
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            placeholderTextColor="rgb(65,65,65)"
            style={styles.input}
            value={email}
            onChangeText={(email) => setEmail(email)}
            placeholder={"Email"}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            placeholderTextColor="rgb(65,65,65)"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(password) => setPassword(password)}
            placeholder={"Password"}
          />
        </View>
        <TouchableOpacity
          disabled={loading}
          style={styles.button}
          onPress={handleSignin}
        >
          {loading && (
            <ActivityIndicator
              size={28}
              style={{ marginRight: 10 }}
              color={"#fff"}
            />
          )}
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateMode("register")}>
          <Text style={styles.tip}>
            Don't have account? <Text style={styles.tipSign}>Signup</Text>
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
    gap: 10,
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
    borderColor: "gray",
    borderRadius: 5,
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
});
