import React from "react";
import {
  Image,
  TouchableOpacity,
} from "react-native";
//@ts-ignore
import CartImg from "../assets/images/cart.png";
import { useRouter } from "expo-router";

export default function CartBtn() {
  const navigation = useRouter();
  const handleCartbtn = () => {
    navigation.push("/home/cart");
  };
  return (
    <TouchableOpacity onPress={handleCartbtn}>
      <Image style={{ width: 50, height: 50 }} source={CartImg} />
    </TouchableOpacity>
  );
}
