import React from "react";
import { Feather } from "@expo/vector-icons";
import { View, TextInput, StyleSheet } from "react-native";

export default function SearchBar({
  updateSearch,
}: {
  updateSearch: (_searchString: string) => void;
}) {
  const [searchString, _setSearchString] = React.useState("");
  const searchStringUpdate = (_searchString: string) => {
    updateSearch(_searchString);
    _setSearchString(_searchString);
  }
  return (
    <View style={styles.searchSection}>
      <Feather name="search" size={20} color="white" />
      <TextInput
        style={styles.input}
        onChangeText={(_searchString) => searchStringUpdate(_searchString)}
        underlineColorAndroid="transparent"
        value={searchString}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  searchSection: {
    flex: 1,
    height: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#424242",
    borderRadius: 10,
    marginRight: 10,
    overflow: "hidden",
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#919191",
  },
  input: {
    flex: 1,
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    backgroundColor: "#424242",
    color: "#fff",
  },
});
