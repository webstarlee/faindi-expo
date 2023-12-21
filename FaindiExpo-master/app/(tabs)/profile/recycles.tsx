import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Dimensions, Image, Pressable } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Text, View } from "../../../components/Themed";
import { useProfile } from "../../../hooks/ProfileContext";
import { getCurrencySymbol } from "../../../utils/common";

export default function RecyclePage() {
  const navigation = useRouter();
  const { ownProducts } = useProfile();

  const recycleProducts = React.useMemo(() => {
    return ownProducts?.filter((own_product) => own_product.is_recycle);
  }, [ownProducts]);

  const makeProductChunk = () => {
    var myArray = [];
    if (recycleProducts.length > 0) {
      for (var i = 0; i < recycleProducts.length; i += 3) {
        myArray.push(recycleProducts.slice(i, i + 3));
      }
    }
    return myArray;
  };

  return (
    <View style={styles.container}>
      {ownProducts.length > 0 ? (
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
                  <View style={styles.likeBox}>
                    <AntDesign
                      style={styles.likeHeart}
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
                  <Text style={styles.productPrice}>{getCurrencySymbol(product.currency)}{product.price}</Text>
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
        })
      ) : (
        <Text>No Own recycled products yet</Text>
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
});
