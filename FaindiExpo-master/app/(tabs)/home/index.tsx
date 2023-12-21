import React from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { Text, View } from "../../../components/Themed";
import FaindiImg from "../../../assets/images/faindi.jpg";
import { useProduct } from "../../../hooks/ProductContext";
import { useAuth } from "../../../hooks/AuthContext";
import { ProductProps } from "../../../hooks/types";
import CategoryItemSkeleton from "../../../components/categorySkeleton";
import ItemSkeleton from "../../../components/itemSkeleton";
import { checkIsLike, getCurrencySymbol } from "../../../utils/common";

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createUniqueRandomArray(length: number, max: number) {
  const uniqueRandomNumberArray: number[] = [];

  while (uniqueRandomNumberArray.length < length) {
    const randomNumber = getRandomNumber(0, max);
    if (!uniqueRandomNumberArray.includes(randomNumber)) {
      uniqueRandomNumberArray.push(randomNumber);
    }
  }

  return uniqueRandomNumberArray;
}

export default function HomeScreen() {
  const navigation = useRouter();
  const windowWidth = Dimensions.get("window").width;
  const imgHeight = windowWidth / 2.75;
  const { isAuthenticated, userId } = useAuth();
  const { products, categories, searchString, productLoading } = useProduct();
  const [allProducts, setAllProducts] = React.useState<ProductProps[] | []>([]);

  const randomArray = createUniqueRandomArray(
    allProducts.length > 5 ? 5 : allProducts.length,
    allProducts.length - 1
  );

  const filteredProducts = React.useMemo(() => {
    if (allProducts) {
      if (searchString) {
        return allProducts.filter((product) =>
          product.title.toUpperCase().includes(searchString.toUpperCase())
        );
      } else {
        return allProducts.filter((_product, index) =>
          randomArray.includes(index)
        );
      }
    } else {
      return null;
    }
  }, [allProducts, searchString]);

  React.useEffect(() => {
    if (products.length > 0) {
      if (isAuthenticated) {
        const filteredProducts = products.filter((product) => {
          return (product.owner._id !== userId && (product.is_recycle || !product.sold));
        });

        setAllProducts(filteredProducts);
      } else {
        setAllProducts(products);
      }
    }
  }, [products, isAuthenticated, userId]);

  const makeProductChunk = () => {
    var myArray = [];
    for (var i = 0; i < allProducts.length; i += 3) {
      myArray.push(allProducts.slice(i, i + 3));
    }
    return myArray;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <Image
          style={{ width: windowWidth, height: imgHeight }}
          source={FaindiImg}
        />
        <Text style={styles.title}>Finds for you</Text>

        <ScrollView horizontal={true}>
          <View style={styles.horizontalProductRow}></View>
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product, _index) => (
              <Pressable
                onPress={() => navigation.push(`/home/product/${product._id}`)}
                key={_index}
                style={styles.horisontalProductContainer}
              >
                <View style={styles.likeBox}>
                  <AntDesign
                    style={[
                      styles.likeHeart,
                      checkIsLike(product, userId) && { color: "#edaeff" },
                    ]}
                    name="heart"
                    size={36}
                    color="white"
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
                <Text style={styles.productPrice}>{getCurrencySymbol(product.currency)}{product.reduced_price > 0? product.reduced_price: product.price}</Text>
              </Pressable>
            ))
          ) : (
            <>
              {productLoading ? (
                <>
                  <ItemSkeleton />
                  <ItemSkeleton />
                  <ItemSkeleton />
                </>
              ) : (
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                    paddingVertical: 20,
                    width: Dimensions.get("window").width
                  }}
                >
                  No Product
                </Text>
              )}
            </>
          )}
        </ScrollView>
        <Text style={styles.title}>Categories</Text>
        <ScrollView horizontal={true}>
          {categories.length > 0 ? (
            categories.map((category) => {
              return (
                <Pressable
                  onPress={() =>
                    navigation.push(`/home/category/${category._id}`)
                  }
                  key={category._id}
                >
                  <View style={styles.categoryContainer}>
                    <View style={styles.itemContainer}>
                      <Image
                        style={{ width: "100%", height: "100%" }}
                        source={{ uri: category.cat_img }}
                      />
                    </View>
                    <Text style={styles.itemTitle}>{category.cat_title}</Text>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <>
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
            </>
          )}
        </ScrollView>
        <Text style={styles.title}>All</Text>
        {allProducts.length > 0 ? (
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
                    <Text style={styles.productPrice}>{getCurrencySymbol(product.currency)}{product.reduced_price > 0? product.reduced_price: product.price}</Text>
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
          <>
            {productLoading ? (
              <ActivityIndicator size={100} color={"#fff"} />
            ) : (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                  paddingVertical: 20,
                }}
              >
                No Product
              </Text>
            )}
          </>
        )}
      </ScrollView>
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
  categoryContainer: {
    width: Dimensions.get("window").width / 4 - 20,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    color: "#fff",
    textTransform: "uppercase",
    textAlign: "center",
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
  horizontalProductRow: {
    display: "flex",
    flexDirection: "row",
    marginVertical: 5,
  },
  productContainer: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 5,
    position: "relative",
  },
  horisontalProductContainer: {
    width: (Dimensions.get("window").width * 30) / 100,
    backgroundColor: "#fff",
    padding: 5,
    position: "relative",
    marginHorizontal: (Dimensions.get("window").width * 10) / 100 / 6,
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
  itemContainer: {
    width: Dimensions.get("window").width / 4 - 20,
    height: Dimensions.get("window").width / 4 - 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderRadius: 20,
  },
  itemTitle: {
    fontSize: 14,
    marginTop: 5,
    color: "#fff",
    textAlign: "center",
  },
});
