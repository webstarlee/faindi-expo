import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import PagerView from "react-native-pager-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import CartBtn from "../../../../components/CartBtn";
import { Text, View } from "../../../../components/Themed";
import { useProduct } from "../../../../hooks/ProductContext";
import { useAuth } from "../../../../hooks/AuthContext";
import { checkIsLike, getCurrencySymbol } from "../../../../utils/common";
import { convertApiUrl } from "../../../../config";
import { useProfile } from "../../../../hooks/ProfileContext";

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const { isAuthenticated, userId, authToken } = useAuth();
  const { carts, addCart, updateCart, updateLikeProducts } = useProfile();
  const navigation = useRouter();
  const { products, updateProductLikes } = useProduct();

  const product = React.useMemo(() => {
    return products?.filter(
      (prod) => prod._id.toString() === id?.toString()
    )[0];
  }, [products, id]);

  const handleProductLike = async () => {
    if (product && userId) {
      const liked = product.likes.filter(
        (like) => like.user_id.toString() === userId.toString()
      );
      if (liked.length > 0) {
        const new_likes = product.likes.filter(
          (like) => like.user_id.toString() !== userId.toString()
        );
        product.likes = new_likes;
      } else {
        const updatedLikes = [...product.likes, { user_id: userId }];
        product.likes = updatedLikes;
      }
      updateProductLikes(product);
      updateLikeProducts(product)

      try {
        await axios.post(
          convertApiUrl("product/like"),
          { product_id: product._id },
          {
            headers: { "x-access-token": authToken },
          }
        );
      } catch (error: any) {
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  const handleProductCart = async () => {
    if (product) {
      const check_seller_carts = carts.filter(
        (cart) => cart.seller._id.toString() === product.owner._id.toString()
      );
      if (check_seller_carts.length > 0) {
        const exist_cart = check_seller_carts[0];
        const exist_cart_product = exist_cart.products.filter(
          (cart_product) => cart_product._id.toString() === product._id
        );

        if (exist_cart_product.length > 0) {
          ToastAndroid.show("already added to cart", ToastAndroid.SHORT);
        } else {
          updateCart(product.owner._id, product);
          try {
            await axios.post(
              convertApiUrl("cart/add"),
              { product_id: product._id },
              {
                headers: { "x-access-token": authToken },
              }
            );

            navigation.push("/home/cart");
          } catch (error: any) {
            // ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
          }
        }
      } else {
        const sigleCart = {
          seller: product.owner,
          products: [product],
        };

        addCart(sigleCart);

        try {
          await axios.post(
            convertApiUrl("cart/add"),
            { product_id: product._id },
            {
              headers: { "x-access-token": authToken },
            }
          );

          navigation.push("/home/cart");
        } catch (error: any) {
          // ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {product ? (
        <>
          <View style={styles.ownerContainer}>
            {product.owner._id.toString() === userId.toString() ? (
              <Image
                style={styles.avatar}
                source={{ uri: product?.owner.avatar }}
              />
            ) : (
              <Pressable
                onPress={() =>
                  navigation.push(`/peoples/user/${product?.owner._id}`)
                }
              >
                <Image
                  style={styles.avatar}
                  source={{ uri: product?.owner.avatar }}
                />
              </Pressable>
            )}
            <View style={styles.ownerNameBox}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                @{product?.owner.username}
              </Text>
              <Text>{product?.owner.title}</Text>
            </View>
            <View style={styles.carBtn}>
              <CartBtn />
            </View>
            {product.owner._id.toString() === userId.toString() && (
              <TouchableOpacity
                onPress={() => navigation.push(`/create/edit/${product._id}`)}
                style={styles.productEditbtn}
              >
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={{ width: "100%" }}>
            <View style={styles.productLabels}>
              <Text style={styles.labelText}>{product.title}</Text>
              <View style={styles.labelSepatator}></View>
              {product.reduced_price > 0 ? (
                <View style={{display: 'flex', position: 'relative', zIndex: 1}}>
                  <Text style={[styles.labelText, styles.labelTextOldPrice]}>{product.price}€</Text>
                  <Text style={[styles.labelText, {lineHeight: 14, textAlign: 'center'}]}>{product.reduced_price}€</Text>
                </View>
              ) : (
                <Text style={styles.labelText}>{product.price}{getCurrencySymbol(product.currency)}</Text>
              )}
              <View style={styles.labelSepatator}></View>
              <Text style={styles.labelText}>{product.size}</Text>
              <View style={styles.labelSepatator}></View>
              <Text style={styles.labelText}>{product.category.cat_title}</Text>
            </View>
            {product.medias.length > 0 && (
              <PagerView style={styles.mediaSlider} initialPage={0}>
                {product.medias.map((media, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {media.media_type === "image" && (
                        <Image
                          style={{
                            resizeMode: "contain",
                            width: "100%",
                            height: "100%",
                          }}
                          source={{ uri: media.uri }}
                        />
                      )}
                      {media.media_type === "video" && (
                        <Video
                          style={styles.video}
                          source={{
                            uri: media.uri,
                          }}
                          shouldPlay
                          useNativeControls
                          resizeMode={ResizeMode.CONTAIN}
                          isLooping
                        />
                      )}
                    </View>
                  );
                })}
              </PagerView>
            )}
            {isAuthenticated &&
              product.owner._id.toString() !== userId.toString() && (
                <View style={styles.controlContainer}>
                  <View
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleProductLike}
                      style={styles.hearBtnContainer}
                    >
                      <AntDesign
                        style={[
                          styles.likeHeart,
                          checkIsLike(product, userId) && { color: "#edaeff" },
                        ]}
                        name="heart"
                        size={36}
                        color="white"
                      />
                      <Text style={styles.likeText}>
                        {product.likes.length}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.push(`/messages/chat/${product.owner._id}`)}
                      style={styles.hearBtnContainer}>
                      <Ionicons
                        style={styles.likeHeart}
                        name="chatbubble-ellipses"
                        size={36}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                  {(product.is_recycle || !product.sold) && (
                    <TouchableOpacity
                      onPress={handleProductCart}
                      style={styles.addCartBtn}
                    >
                      <Text style={styles.addcartBtnText}>Add to cart</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            <Text>{product.description}</Text>
          </ScrollView>
        </>
      ) : (
        <ActivityIndicator size={100} color={"#fff"} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
    paddingHorizontal: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerContainer: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: 20,
    position: "relative",
    paddingTop: 30,
    zIndex: 1,
  },
  carBtn: {
    position: "absolute",
    top: 5,
    right: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  ownerNameBox: {
    flex: 1,
    paddingHorizontal: 10,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  productLabels: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  labelText: {
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  labelSepatator: {
    marginHorizontal: 10,
    fontWeight: "bold",
    width: 1,
    backgroundColor: "#fff",
    height: "100%",
  },
  mediaSlider: {
    flex: 1,
    height: Dimensions.get("window").width - 30,
  },
  siderItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: Dimensions.get("window").width - 30,
    height: "100%",
  },
  controlContainer: {
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
  },
  hearBtnContainer: {
    position: "relative",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  likeHeart: {
    position: "absolute",
  },
  likeText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    paddingBottom: 3,
  },
  addCartBtn: {
    backgroundColor: "#edaeff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addcartBtnText: {
    color: "#000",
    textDecorationColor: "#000",
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  productEditbtn: {
    width: 30,
    height: 30,
    position: "absolute",
    right: -5,
    bottom: -25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "solid",
    borderRadius: 20,
  },
  labelTextOldPrice: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'line-through',
    textDecorationColor: 'red',
    textDecorationStyle: 'solid',
    color: 'red',
    lineHeight: 15
  }
});
