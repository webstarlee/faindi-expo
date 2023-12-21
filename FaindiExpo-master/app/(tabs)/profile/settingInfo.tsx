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

export default function SettingInfo() {
  const { fullName, userEmail, authToken, updateEmailFullname } = useAuth();
  const [userFullname, setUserFullname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [emailVerifyOpen, setEmailVerifyOpen] = React.useState(false);
  const [emailToken, setEmailToken] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");

  React.useEffect(() => {
    if (fullName) {
      setUserFullname(fullName);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [fullName, userEmail]);

  const handleUpdate = async () => {
    if (email !== userEmail) {
      setLoading(true);
      try {
        const infoData = {
          fullname: userFullname,
          email: email,
        };
        const response = await axios.post(
          convertApiUrl("profile/send-email-verify"),
          infoData,
          {
            headers: { "x-access-token": authToken },
          }
        );

        setLoading(false);

        if (response.data.success) {
          console.log(response.data);
          setEmailToken(response.data.token);
          setEmailVerifyOpen(true);
        }
      } catch (error: any) {
        setLoading(false);
        console.log(error);
      }
    }
  };

  const handleVerifyUpdate = async () => {
    if (emailToken !== "" && emailCode !== "") {
      setEmailLoading(true);
      try {
        const verifyData = {
          token: emailToken,
          number: emailCode,
        };

        console.log(verifyData);

        const response = await axios.post(
          convertApiUrl("profile/email-verify"),
          verifyData,
          {
            headers: { "x-access-token": authToken },
          }
        );

        setEmailLoading(false);
        setEmailVerifyOpen(false);
        setEmailToken("");
        setEmailCode("");
        if (response.data.success) {
          const infoData = {
            fullname: userFullname,
            email: email,
          };

          setLoading(true);
          try {
            const response = await axios.post(
              convertApiUrl("profile/update/fullname-email"),
              infoData,
              {
                headers: { "x-access-token": authToken },
              }
            );

            setLoading(false);

            if (response.data.success) {
              updateEmailFullname(userFullname, email);
              ToastAndroid.show(
                "Infomation updated successfully",
                ToastAndroid.SHORT
              );
            }
          } catch (error: any) {
            setLoading(false);
            console.log(error);
          }
        }
      } catch (error: any) {
        setEmailLoading(false);
        setEmailVerifyOpen(false);
        setEmailToken("");
        setEmailCode("");
        console.log(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Fullname:</Text>
        <TextInput
          placeholderTextColor="rgb(65,65,65)"
          style={styles.input}
          value={userFullname}
          onChangeText={(_fullname) => setUserFullname(_fullname)}
          placeholder={"Fullname"}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput
          placeholderTextColor="rgb(65,65,65)"
          style={styles.input}
          value={email}
          onChangeText={(_email) => setEmail(_email)}
          placeholder={"Email"}
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

      <Modal animationType="fade" transparent={true} visible={emailVerifyOpen}>
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() => setEmailVerifyOpen(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.modalOverlay}></View>
          </Pressable>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Verify Code:</Text>
              <TextInput
                placeholderTextColor="rgb(65,65,65)"
                style={styles.input}
                value={emailCode}
                onChangeText={(_emailCode) => setEmailCode(_emailCode)}
                placeholder={"Code"}
              />
            </View>
            <TouchableOpacity
              onPress={handleVerifyUpdate}
              style={styles.modalBtnCancel}
            >
              {emailLoading && (
                <ActivityIndicator
                  size={28}
                  style={{ marginRight: 10 }}
                  color={"#fff"}
                />
              )}
              <Text style={styles.modalBtnCancelText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    maxHeight: 500,
  },
  modalBtnCancel: {
    width: "100%",
    height: 40,
    backgroundColor: "#10c74e",
    display: "flex",
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 10,
  },
  modalBtnCancelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
