import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Text, View } from "./Themed";
import Signin from "./Signin";
import Signup from "./Signup";
import Verify from "./Verify";

export default function AuthModal() {
  const [mode, setMode] = React.useState("login");

  const updateMode = (_mode: string) => {
    setMode(_mode);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 50,
          paddingHorizontal: 15,
          minHeight: '100%'
        }}
        style={{width: "100%"}}
      >
        {mode === "login" && <Signin updateMode={updateMode} />}
        {mode === "register" && <Signup updateMode={updateMode} />}
        {mode === "verify" && <Verify updateMode={updateMode} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
