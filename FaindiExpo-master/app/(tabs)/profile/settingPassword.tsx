import React from "react";
import axios from "axios";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import { convertApiUrl } from "../../../config";

export default function SettingPassword() {
  const { authToken } = useAuth();
  const [oldPassword, setOldPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleUpdate = async () => {
    if (oldPassword === "") {
      ToastAndroid.show("Please Input Old Password!", ToastAndroid.SHORT);
      return;
    }

    if (password === "") {
      ToastAndroid.show("Please Input New Password!", ToastAndroid.SHORT);
      return;
    }

    if (password !== passwordConfirm) {
      ToastAndroid.show("Please Match New Password Confirm!", ToastAndroid.SHORT);
      return;
    }

    const passData = {
      new_password: password,
      old_password: oldPassword
    };

    try {
      const response = await axios.post(
        convertApiUrl("profile/update/password"),
        passData,
        {
          headers: { "x-access-token": authToken },
        }
      );
      setLoading(false);

      if (response.data.success) {
        ToastAndroid.show("Password Updated Successfully!", ToastAndroid.SHORT);
        setOldPassword("");
        setPassword("");
        setPasswordConfirm("");
      } else {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Old Password:</Text>
        <TextInput
          placeholderTextColor="rgb(65,65,65)"
          style={styles.input}
          value={oldPassword}
          secureTextEntry
          onChangeText={(_oldPassword) => setOldPassword(_oldPassword)}
          placeholder={"Old Password"}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>New Password:</Text>
        <TextInput
          placeholderTextColor="rgb(65,65,65)"
          style={styles.input}
          value={password}
          secureTextEntry
          onChangeText={(_password) => setPassword(_password)}
          placeholder={"New Password"}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>New Password Confirm:</Text>
        <TextInput
          placeholderTextColor="rgb(65,65,65)"
          style={styles.input}
          secureTextEntry
          value={passwordConfirm}
          onChangeText={(_passwordConfirm) => setPasswordConfirm(_passwordConfirm)}
          placeholder={"New Password Confirm"}
        />
      </View>
      <TouchableOpacity
        onPress={handleUpdate}
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
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 16,
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
  formGroup: {
    width: "100%",
    marginBottom: 10,
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
});
