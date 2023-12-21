import React from "react";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, Dimensions, Image, Pressable } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Text, View } from "../../../../components/Themed";
import { ProductProps } from "../../../../hooks/types";
import { checkIsLike, getCurrencySymbol } from "../../../../utils/common";
import { useAuth } from "../../../../hooks/AuthContext";

interface UserProductsPageProps {
  products: ProductProps[] | [];
}

export default function UserProductsPage({ products }: UserProductsPageProps) {
  const navigation = useRouter();
  const { userId } = useAuth();
  const makeProductChunk = () => {
    var myArray = [];
    if (products.length > 0) {
      for (var i = 0; i < products.length; i += 3) {
        myArray.push(products.slice(i, i + 3));
      }
    }
    return myArray;
  };

  console.log(products);

  return (
    <View style={styles.container}>
      {products.length > 0 &&
        makeProductChunk().map((prodcuts, index) => {
          return (
            <View key={index} style={styles.productRow}>
              {prodcuts.map((product, _index) => (
                <Pressable
                  onPress={() =>
                    navigation.push(`/home/product/${product._id}`)
                  }
                  key={_index}
                  style={styles.productContainer}
                >
                  {!product.is_recycle && product.sold && (
                    <View style={styles.soldOutBox}>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 20,
                          fontWeight: "bold",
                        }}
                      >
                        Sold Out
                      </Text>
                    </View>
                  )}
                  <View style={styles.likeBox}>
                    <AntDesign
                      style={[
                        styles.likeHeart,
                        checkIsLike(product, userId) && {
                          color: "#edaeff",
                        },
                      ]}
                      name="heart"
                      size={36}
                      color="white"
                    />
                    <AntDesign
                      style={[styles.likeHeart, { opacity: 0.3 }]}
                      name="hearto"
                      size={36}
                      color="#0f0f0f"
                    />
                    <Text style={styles.likeTxt}>{product.likes.length}</Text>
                  </View>
                  {product.medias[0].media_type === "image" && (
                    <Image
                      style={styles.productImg}
                      source={{ uri: product.medias[0].uri }}
                    />
                  )}
                  {product.medias[0].media_type === "video" && (
                    <Video
                      style={styles.video}
                      source={{
                        uri: product.medias[0].uri,
                      }}
                      shouldPlay
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                    />
                  )}
                  <Text style={styles.productTitle}>
                    {product.title.length > 11
                      ? product.title.substring(0, 11) + "..."
                      : product.title}
                  </Text>
                  <Text style={styles.productPrice}>
                    {product.reduced_price > 0
                      ? product.reduced_price
                      : product.price}{" "}
                    {getCurrencySymbol(product.currency)}
                  </Text>
                </Pressable>
              ))}
              {prodcuts.length === 2 && (
                <View style={styles.fakeProductContainer}></View>
              )}
              {prodcuts.length === 1 && (
                <>
                  <View style={styles.fakeProductContainer}></View>
                  <View style={styles.fakeProductContainer}></View>
                </>
              )}
            </View>
          );
        })}
      {products.length === 0 && (
        <View>
          <Text>No user's products</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingTop: 10,
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
  productRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 5,
  },
  productContainer: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 5,
    position: "relative",
  },
  fakeProductContainer: {
    width: "30%",
    backgroundColor: "transparent",
    padding: 5,
    position: "relative",
  },
  productImg: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 30,
    resizeMode: "cover",
  },
  video: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 30,
  },
  productTitle: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 3,
  },
  productPrice: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  likeBox: {
    position: "absolute",
    width: 34,
    height: 30,
    backgroundColor: "transparent",
    top: 5,
    right: 6,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  likeHeart: {
    position: "absolute",
    top: -2,
    left: -1,
    opacity: 0.8,
  },
  likeTxt: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  soldOutBox: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
