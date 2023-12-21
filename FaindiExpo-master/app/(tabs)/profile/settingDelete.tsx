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

export default function SettingDelete() {
  const { authToken, logout } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await axios.get(convertApiUrl("profile/delete"), {
        headers: { "x-access-token": authToken },
      });

      setLoading(false);

      if (response.data.success) {
        logout();
        ToastAndroid.show(
          "Your account deleted successfully",
          ToastAndroid.SHORT
        );
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      if (error?.response.status === 404) {
        ToastAndroid.show(error?.response.data.message, ToastAndroid.SHORT);
      }
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.deleteLabel}>Want to Delete your Faindi account</Text>
      <TouchableOpacity
        onPress={() => setDeleteOpen(true)}
        disabled={loading}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Delete My Account</Text>
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={deleteOpen}>
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() => setDeleteOpen(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.modalOverlay}></View>
          </Pressable>

          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 20,
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              Are you sure to delete account ?
            </Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={styles.logoutModalBtn}
            >
              {loading && (
                <ActivityIndicator
                  size={28}
                  style={{ marginRight: 10 }}
                  color={"#fff"}
                />
              )}
              <Text style={styles.logoutModalBtnTxt}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDeleteOpen(false)}
              style={styles.logoutModalBtnCancel}
            >
              <Text style={styles.logoutModalBtnTxt}>Cancel</Text>
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
    alignItems: "center",
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
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 5,
    backgroundColor: "#ff4b4b",
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
  deleteLabel: {
    fontSize: 18,
    color: "#ff4b4b",
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
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
  logoutModalBtn: {
    width: "100%",
    height: 40,
    backgroundColor: "#db3c3c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10,
    flexDirection: 'row'
  },
  logoutModalBtnCancel: {
    width: "100%",
    height: 40,
    backgroundColor: "#10c74e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10,
  },
  logoutModalBtnTxt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
