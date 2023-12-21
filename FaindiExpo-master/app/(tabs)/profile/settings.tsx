import React from "react";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, View } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import { AntDesign } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import AuthModal from "../../../components/AuthModal";
import SettingInfo from "./settingInfo";
import SettingPassword from "./settingPassword";
import SettingDelete from "./settingDelete";

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = React.useState(1);

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          <View style={styles.tabHeaderBox}>
            <TouchableOpacity
              onPress={() => setCurrentTab(1)}
              style={styles.tabHeaderBtn}
            >
              <AntDesign
                name="infocirlce"
                size={30}
                color={currentTab === 1 ? "#edaeff" : "white"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentTab(2)}
              style={styles.tabHeaderBtn}
            >
              <Fontisto
                name="locked"
                size={30}
                color={currentTab === 2 ? "#edaeff" : "white"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentTab(3)}
              style={styles.tabHeaderBtn}
            >
              <MaterialIcons
                name="delete"
                size={34}
                color={currentTab === 3 ? "#edaeff" : "white"}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ width: "100%" }}>
            {currentTab === 1 && <SettingInfo />}
            {currentTab === 2 && <SettingPassword />}
            {currentTab === 3 && <SettingDelete />}
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
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tabHeaderBox: {
    width: "100%",
    height: 50,
    display: "flex",
    flexDirection: "row",
    borderBottomColor: "#ddd",
    borderTopColor: "#ddd",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderStyle: "solid",
  },
  tabHeaderBtn: {
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
