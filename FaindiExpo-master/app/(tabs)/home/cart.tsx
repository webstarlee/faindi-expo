import React from "react";
import axios from "axios";
import {
  StyleSheet,
  Image,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { Text, View } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import { useProfile } from "../../../hooks/ProfileContext";
import AuthModal from "../../../components/AuthModal";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import tempAvatar from "../../../assets/images/users/default.png";
import { ProductProps } from "../../../hooks/types";
import { convertApiUrl } from "../../../config";
import { useProduct } from "../../../hooks/ProductContext";
import { getCurrencySymbol } from "../../../utils/common";

export default function CartPage() {
  const { isAuthenticated, authToken } = useAuth();
  const { setProductSold } = useProduct();
  const { carts, updateCart, remmoveCart, addOrder } = useProfile();
  const [isloading, setIsloading] = React.useState(false);

  const handleRemoveCartProduct = async (
    _seller_id: string,
    _product: ProductProps
  ) => {
    updateCart(_seller_id, _product);
    try {
      await axios.post(
        convertApiUrl("cart/update"),
        { product_id: _product._id },
        {
          headers: { "x-access-token": authToken },
        }
      );
    } catch (error: any) {
      ToastAndroid.show(error?.response.data.message, ToastAndroid.SHORT);
    }
  };

  const handleOrder = async (_seller_id: string) => {
    setIsloading(true);
    try {
      const response = await axios.post(
        convertApiUrl("order/make"),
        { seller_id: _seller_id },
        {
          headers: { "x-access-token": authToken },
        }
      );

      const ordered_cart = carts.filter((_cart) => _cart.seller._id.toString() === _seller_id.toString())[0];
      if (ordered_cart) {
        ordered_cart.products.map((_product) => {
          setProductSold(_product._id);
        })
      }

      setIsloading(false);
      remmoveCart(_seller_id);
      addOrder(response.data.orders);
    } catch (error: any) {
      setIsloading(false);
      console.log(error?.response);
      if (error?.response.status === 400) {
        ToastAndroid.show(error?.response.data.message, ToastAndroid.SHORT);
      }
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          <Text style={styles.title}>Shopping cart</Text>
          <View style={styles.divider}></View>
          {carts.length === 0 && (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Your cart is empty
            </Text>
          )}
          <ScrollView>
            {carts.length > 0 &&
              carts.map((cart, index) => {
                var priceSum = 0;
                var priceCurrency = cart.products[0].currency;
                cart.products.map((prod) => {
                  if (Number(prod.reduced_price) > 0) {
                    priceSum += Number(prod.reduced_price);
                  } else {
                    priceSum += Number(prod.price);
                  }
                });

                return (
                  <View key={index} style={styles.cartsContainer}>
                    <View style={styles.sellerPriceContainer}>
                      <Image
                        style={styles.avatarImg}
                        source={
                          cart.seller ? { uri: cart.seller.avatar } : tempAvatar
                        }
                      />
                      <Text
                        style={{
                          paddingLeft: 10,
                          fontWeight: "bold",
                          fontSize: 16,
                          flex: 1,
                        }}
                      >
                        @{cart.seller.username}
                      </Text>
                      <View>
                        <Text style={{ fontWeight: "bold" }}>{priceSum} {getCurrencySymbol(priceCurrency)}</Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                          5.5 {getCurrencySymbol(priceCurrency)} Shipping
                        </Text>
                      </View>
                    </View>
                    <ScrollView horizontal={true} style={{ paddingTop: 15 }}>
                      {cart.products.map((cartProd, _index) => {
                        return (
                          <View
                            key={_index}
                            style={styles.singleProductContainer}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                handleRemoveCartProduct(
                                  cart.seller._id,
                                  cartProd
                                )
                              }
                            >
                              <AntDesign
                                name="closecircleo"
                                size={24}
                                color="white"
                              />
                            </TouchableOpacity>
                            <View style={styles.productBox}>
                              {cartProd.medias.length > 0 ? (
                                <>
                                  {cartProd.medias[0].media_type === "image" ? (
                                    <Image
                                      style={{
                                        width: "100%",
                                        height: 80,
                                        resizeMode: "cover",
                                      }}
                                      source={{ uri: cartProd.medias[0].uri }}
                                    />
                                  ) : (
                                    <Video
                                      style={{
                                        width: "100%",
                                        height: 80,
                                      }}
                                      shouldPlay
                                      useNativeControls
                                      resizeMode={ResizeMode.CONTAIN}
                                      source={{ uri: cartProd.medias[0].uri }}
                                      isLooping
                                    />
                                  )}
                                </>
                              ) : (
                                <View></View>
                              )}
                              <Text
                                style={{
                                  color: "#000",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                {cartProd.title}
                              </Text>
                              <Text
                                style={{
                                  color: "#000",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                {cartProd.reduced_price>0? cartProd.reduced_price: cartProd.price} {getCurrencySymbol(cartProd.currency)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                    <View style={styles.checkoutBtnContainer}>
                      <TouchableOpacity
                        onPress={() => handleOrder(cart.seller._id)}
                        style={styles.checkoutBtn}
                      >
                        {isloading ? (
                          <ActivityIndicator
                            size={20}
                            style={{}}
                            color={"#fff"}
                          />
                        ) : (
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#000",
                              fontWeight: "bold",
                              textAlign: "center",
                              lineHeight: 12,
                              marginTop: 4,
                            }}
                          >
                            Continue to{"\n"} checkout
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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
    width: "100%",
    flex: 1,
  },
  title: {
    textTransform: "uppercase",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 10,
  },
  cartsContainer: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
  sellerPriceContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  singleProductContainer: {
    display: "flex",
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "flex-end",
  },
  productBox: {
    width: 100,
    backgroundColor: "#fff",
    padding: 5,
    marginLeft: 5,
  },
  checkoutBtnContainer: {
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    paddingTop: 20,
  },
  checkoutBtn: {
    width: 100,
    height: 40,
    backgroundColor: "#edaeff",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
});
