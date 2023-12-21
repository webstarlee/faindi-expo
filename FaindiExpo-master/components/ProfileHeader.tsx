import React from "react";
import { Link } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/AuthContext";
import { usePathname } from "expo-router";

function contains(target: string, pattern: string[]){
  var value = 0;

  pattern.forEach(function(word){
    const result = target.includes(word)? 1: 0;
    value = value + result;
  });

  return (value === 1)
}

export default function ProfileHeader() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const currentRouteName = usePathname();

  console.log(currentRouteName)

  return (
    <>
      <View style={{ paddingTop: insets.top, backgroundColor: "#000" }} />
      {isAuthenticated && (
        <View style={styles.headerStyle}>
          <Link href="/profile/notifications" asChild>
            <TouchableOpacity>
              <Ionicons name="notifications" size={28} color={contains(currentRouteName, ['profile/notifications']) ? "#edaeff": "#fff"} />
            </TouchableOpacity>
          </Link>
          <Link href="/profile/settings" asChild>
            <TouchableOpacity>
            <Ionicons name="settings-sharp" size={28} color={contains(currentRouteName, ['profile/settings']) ? "#edaeff": "#fff"} />
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    width: "100%",
    backgroundColor: "#000",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
  },
});
