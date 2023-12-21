import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CartBtn from "./CartBtn";
import SearchBar from "./SearchBar";
import { useProduct } from "../hooks/ProductContext";
import { usePathname } from "expo-router";

function contains(target: string, pattern: string[]){
  var value = 0;

  pattern.forEach(function(word){
    const result = target.includes(word)? 1: 0;
    value = value + result;
  });

  return (value === 1)
}

export default function IndexHeader() {
  const currentRouteName = usePathname();
  const { updateSearchString } = useProduct();
  const insets = useSafeAreaInsets();
  const updateSearch = (search: string) => {
    updateSearchString(search);
  };

  return (
    <>
      <View style={{ paddingTop: insets.top, backgroundColor: "#000" }} />
      {!contains(currentRouteName, ['home/product/', 'home/cart']) && (
        <View style={styles.headerStyle}>
          <SearchBar updateSearch={updateSearch} />
          <CartBtn />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    width: "100%",
    backgroundColor: "#000000",
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
});
