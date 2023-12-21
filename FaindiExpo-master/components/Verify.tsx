import React from "react";
import {
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Text, View } from "./Themed";
import { convertApiUrl } from "../config";
import { useAuth } from "../hooks/AuthContext";

export default function Verify({
  updateMode,
}: {
  updateMode: (mode: string) => void;
}) {
  const { verifyEmail, verifyToken, updateVerifyToken, login } = useAuth();
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleVerify = async () => {
    if (code === "") {
      ToastAndroid.show("Please Input Verify Code!", ToastAndroid.SHORT);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(convertApiUrl("auth/verify"), {
        token: verifyToken,
        number: code,
      });
      ToastAndroid.show("Email verified successfully", ToastAndroid.SHORT);
      const user = response.data.user;
      const accessToken = response.data.accessToken;
      login(
        user.user_id,
        user.fullName,
        user.email,
        user.username,
        user.avatar,
        "",
        accessToken,
        user.title,
        user.bio
      );
    } catch (error: any) {
      setLoading(false);
      if (error?.response.status === 400) {
        ToastAndroid.show(error?.response.data.message, ToastAndroid.SHORT);
      }
    }
  };

  const handleResendVerifyEmail = async () => {
    try {
      const response = await axios.post(convertApiUrl("auth/send-verify"), {
        email: verifyEmail,
      });
      if (response?.data) {
        setLoading(false);
        ToastAndroid.show(
          "Verify Email sent successfully!",
          ToastAndroid.SHORT
        );
        updateVerifyToken(response?.data.token);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <Text style={styles.title}>FAINDI</Text>
      <Text style={styles.subTitle}>Activate your account</Text>
      <Text style={styles.subTitle1}>
        We sent Code to your email{"\n"}Please check your Email
      </Text>
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Code</Text>
          <TextInput
            placeholderTextColor="rgb(65,65,65)"
            style={styles.input}
            value={code}
            onChangeText={(code) => setCode(code)}
            placeholder={"Code"}
          />
        </View>
        <TouchableOpacity
          onPress={handleVerify}
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
          <Text style={styles.buttonText}>Activate</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResendVerifyEmail}>
          <Text style={styles.tip}>Or Resend Email</Text>
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
  subTitle1: {
    color: "#ddd",
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
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
