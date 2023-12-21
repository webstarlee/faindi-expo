import React from "react";
import { Link, Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons'; 

export default function CommonHeader() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={{ paddingTop: insets.top, backgroundColor: "#000" }} />
      {/* <View style={styles.headerStyle}>
        <Link href="/modal" asChild><TouchableOpacity><Ionicons name="notifications" size={24} color="#fff" /></TouchableOpacity></Link>
        <Ionicons name="settings-sharp" size={24} color="#fff" />
      </View> */}
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
    paddingBottom: 20,
    paddingTop: 10,
  },
});
