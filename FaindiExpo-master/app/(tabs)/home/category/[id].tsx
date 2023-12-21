import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "../../../../components/Themed";
import { useProduct } from "../../../../hooks/ProductContext";
import { ProductProps } from "../../../../hooks/types";
import RangeSlider from "../../../../components/RangeSlider";
import SizeSlider from "../../../../components/SizeSlider";
import { useAuth } from "../../../../hooks/AuthContext";
import { checkIsLike, getCurrencySymbol } from "../../../../utils/common";

function compareA(a: ProductProps, b: ProductProps) {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
}

function compareB(a: ProductProps, b: ProductProps) {
  if (a.title > b.title) {
    return -1;
  }
  if (a.title < b.title) {
    return 1;
  }
  return 0;
}

export default function CategoryView() {
  const { id } = useLocalSearchParams();
  const navigation = useRouter();
  const { userId } = useAuth();
  const { categories, products, searchString } = useProduct();
  const [isSort, setIsSort] = React.useState(false);
  const [catProducts, setCatProducts] = React.useState<ProductProps[] | []>([]);
  const [openFilterModal, setOpenFilterModal] = React.useState(false);
  const [priceFrom, setPriceFrom] = React.useState(0);
  const [priceTo, setPriceTo] = React.useState(300);
  const [FpriceFrom, setFPriceFrom] = React.useState(0);
  const [FpriceTo, setFPriceTo] = React.useState(300);
  const [sizeFrom, setSizeFrom] = React.useState(0);
  const [sizeTo, setSizeTo] = React.useState(6);
  const [FsizeFrom, setFSizeFrom] = React.useState(0);
  const [FsizeTo, setFSizeTo] = React.useState(6);

  const sizeArray = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

  const category = React.useMemo(() => {
    return categories?.filter((cat) => cat._id.toString() === id)[0];
  }, [categories, id]);

  const toggleFilterView = () => {
    setOpenFilterModal((prev) => !prev);
  };

  const toggleSort = () => {
    setIsSort((prev) => !prev);
  };

  const updateProductWithFilter = () => {
    setFPriceFrom(priceFrom);
    setFPriceTo(priceTo);
    setFSizeFrom(sizeFrom);
    setFSizeTo(sizeTo);
    setOpenFilterModal(false);
  };

  const filteredProducts = React.useMemo(() => {
    if (products) {
      let finalProducts = products.filter(
        (product) => product.category._id.toString() === id?.toString()
      );

      finalProducts = finalProducts.filter(
        (product) =>
          Number(product.price) >= FpriceFrom &&
          Number(product.price) <= FpriceTo
      );

      finalProducts = finalProducts.filter(
        (product) =>
          sizeArray.indexOf(product.size.toUpperCase()) >= FsizeFrom &&
          sizeArray.indexOf(product.size.toUpperCase()) <= FsizeTo
      );

      if (searchString) {
        finalProducts = finalProducts.filter((product) =>
          product.title.toUpperCase().includes(searchString.toUpperCase())
        );
      }

      if (isSort) {
        finalProducts.sort(compareA);
      } else {
        finalProducts.sort(compareB);
      }

      return finalProducts;
    } else {
      return null;
    }
  }, [
    id,
    products,
    searchString,
    FpriceFrom,
    FpriceTo,
    isSort,
    FsizeFrom,
    FsizeTo,
  ]);

  const makeProductChunk = () => {
    var myArray = [];
    if (filteredProducts && filteredProducts.length > 0) {
      for (var i = 0; i < filteredProducts.length; i += 3) {
        myArray.push(filteredProducts.slice(i, i + 3));
      }
    }
    return myArray;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.toolBtnContainer}>
          <TouchableOpacity style={styles.toolBtn} onPress={toggleSort}>
            <Text style={styles.toolBtnText}>Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={toggleFilterView}>
            <Text style={styles.toolBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>
        {openFilterModal && (
          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <RangeSlider
              from={0}
              to={300}
              oldLow={priceFrom}
              oldHigh={priceTo}
              updateFrom={setPriceFrom}
              updateTo={setPriceTo}
            />

            <SizeSlider
              from={0}
              to={6}
              oldLow={sizeFrom}
              oldHigh={sizeTo}
              updateFrom={setSizeFrom}
              updateTo={setSizeTo}
            />
            <TouchableOpacity
              style={{
                borderColor: "#fff",
                borderWidth: 1,
                borderStyle: "solid",
                padding: 10,
                marginTop: 20,
                borderRadius: 10,
              }}
              onPress={updateProductWithFilter}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Update Filter
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.categoryTitleText}>
          {category && category.cat_title}
        </Text>
        <ScrollView style={{ width: "100%" }}>
          {filteredProducts && filteredProducts.length > 0 ? (
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
                        <Text style={styles.likeTxt}>
                          {product.likes.length}
                        </Text>
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
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              No Products for {category && category.cat_title}
            </Text>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  toolBtnContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
  toolBtn: {
    backgroundColor: "#ddd",
    width: 100,
    height: 40,
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toolBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  categoryTitleText: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  formGroup: {
    width: "45%",
    marginTop: 10,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    fontSize: 15,
    paddingHorizontal: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingTop: 5,
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
