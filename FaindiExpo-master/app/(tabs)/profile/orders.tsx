import React from "react";
import axios from "axios";
import { Video, ResizeMode } from "expo-av";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "../../../components/Themed";
import { useProfile } from "../../../hooks/ProfileContext";
import { convertApiUrl } from "../../../config";
import { useAuth } from "../../../hooks/AuthContext";
import { MessageProps } from "../../../hooks/types";
import { useChat } from "../../../hooks/ChatContext";
import { getCurrencySymbol } from "../../../utils/common";

function formatDate(date: string) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("/");
}

export default function OrdersPage() {
  const navigation = useRouter();
  const { authToken, userId } = useAuth();
  const { orders, setOrderDeleivered } = useProfile();
  const { addMessageChat } = useChat();

  const handleOrderDelivered = async (
    _order_id: string,
    _product_id: string,
    _seller_id: string
  ) => {
    try {
      const response = await axios.post(
        convertApiUrl("order/delivered"),
        { order_id: _order_id },
        {
          headers: { "x-access-token": authToken },
        }
      );
      
      if (response.status === 200) {
        setOrderDeleivered(_order_id);
        const new_message: MessageProps = {
          receiver_id: userId,
          sender_id: "Faindi",
          is_faindi: true,
          is_rate: true,
          product_id: _product_id.toString(),
          is_read: true,
          content: "Make your Review",
          medias: [],
          created_at: new Date().toISOString(),
        };

        addMessageChat(_seller_id, new_message);

        navigation.push(`/messages/chat/${_seller_id}`);
      }
    } catch (error: any) {
      ToastAndroid.show(error?.response.data.message, ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      {orders.length > 0 &&
        orders.map((order, index) => {
          return (
            <View key={index} style={styles.orderAllContainer}>
              <View style={styles.orderContainer}>
                <View style={styles.prodContainer}>
                  {order.product.medias[0].media_type === "image" && (
                    <Image
                      style={{ width: 60, height: 50 }}
                      source={{ uri: order.product.medias[0].uri }}
                    />
                  )}
                  {order.product.medias[0].media_type === "video" && (
                    <Video
                      style={{
                        width: 50,
                        height: 50,
                      }}
                      shouldPlay
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      source={{ uri: order.product.medias[0].uri }}
                      isLooping
                    />
                  )}
                  <Text style={{ color: "#000", fontSize: 10 }}>
                    {order.product.title}
                  </Text>
                </View>
                <View style={styles.orderDescriptionBox}>
                  <Text>
                    You ordered "{order.product.title}" on{" "}
                    {formatDate(order.orderTime.toString())} from @
                    {order.seller.username}
                  </Text>
                  <Text>{order.product.price} {getCurrencySymbol(order.product.currency)}</Text>
                  {order.readyPick && !order.delivered && (
                    <TouchableOpacity
                      onPress={() =>
                        handleOrderDelivered(
                          order._id,
                          order.product._id,
                          order.seller._id
                        )
                      }
                      style={styles.deliveredBtn}
                    >
                      <Text style={{ color: "#000" }}>Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      {orders.length === 0 && <Text>Order Not found</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  orderAllContainer: {
    width: "100%",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    borderStyle: "solid",
    paddingHorizontal: 5,
    paddingBottom: 5,
    marginBottom: 10
  },
  orderContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    paddingBottom: 5,
  },
  prodContainer: {
    width: 70,
    backgroundColor: "#ddd",
    display: "flex",
    alignItems: "center",
    paddingVertical: 5,
  },
  orderDescriptionBox: {
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 5,
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
  },
  deliveredBtn: {
    position: "absolute",
    width: 100,
    height: 30,
    backgroundColor: "#edaeff",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  orderStatusContainer: {
    width: "100%",
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderStatusViewBox: {
    backgroundColor: "gray",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
  },
});
