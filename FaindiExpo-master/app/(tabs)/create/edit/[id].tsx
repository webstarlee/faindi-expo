import React from "react";
import axios from "axios";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  Image,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import PagerView from "react-native-pager-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "../../../../components/Themed";
import { useProduct } from "../../../../hooks/ProductContext";
import { MediaProps, CategoryProps } from "../../../../hooks/types";
import { uploadMedia } from "../../../../utils/firebase";
import { convertApiUrl } from "../../../../config";
import { useAuth } from "../../../../hooks/AuthContext";
import { useProfile } from "../../../../hooks/ProfileContext";

export default function ProductEdit() {
  const { id } = useLocalSearchParams();
  const navigation = useRouter();
  const { authToken } = useAuth();
  const { updateOwnProduct } = useProfile();
  const { categories, products, updateProduct } = useProduct();
  const [catModalOpen, setCatModalOpen] = React.useState(false);
  const [sizeModalOpen, setSizeModalOpen] = React.useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = React.useState(false);
  const [proCategory, setProCategory] = React.useState(
    categories.length > 0 ? categories[0] : null
  );
  const [title, setTitle] = React.useState("");
  const [size, setSize] = React.useState("M");
  const [price, setPrice] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [isRecycle, setIsRecycle] = React.useState(false);
  const [reducedPrice, setReducedPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [medias, setMedias] = React.useState<MediaProps[]>([]);
  const [tempMedias, setTempMedias] = React.useState<MediaProps[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = React.useState(false);

  const product = React.useMemo(() => {
    return products?.filter(
      (prod) => prod._id.toString() === id?.toString()
    )[0];
  }, [products, id]);

  React.useEffect(() => {
    if (product) {
      setTitle(product.title);
      setSize(product.size);
      setIsRecycle(product.is_recycle);
      setPrice(product.price.toString());
      setCurrency(product.currency.toString());
      setReducedPrice(product.reduced_price.toString());
      setDescription(product.description);
      setTitle(product.title);
      setMedias(product.medias);
      setTempMedias(product.medias);
      setProCategory(product.category);
    }
  }, [product]);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const _temMedia = {
        media_type: result.assets[0].type || "image",
        uri: result.assets[0].uri,
      };
      setTempMedias([_temMedia, ...tempMedias]);
      setMediaUploadLoading(true);
      const mediaUrl = await uploadMedia("products", result.assets[0].uri);
      setMediaUploadLoading(false);
      const _media = {
        media_type: result.assets[0].type || "image",
        uri: mediaUrl as string,
      };
      setMedias([_media, ...medias]);
    } else {
      ToastAndroid.show("You didn't selected image!", ToastAndroid.SHORT);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const _tempMedia = [...tempMedias];
    const _media = [...medias];
    _tempMedia?.splice(index, 1);
    setTempMedias(_tempMedia);
    _media?.splice(index, 1);
    setMedias(_media);
  };

  const handleResetForm = () => {
    setTitle("");
    setSize("");
    setPrice("");
    setDescription("");
    setMedias([]);
    setTempMedias([]);
    setIsRecycle(false)
  };

  const showRemoveMeidaAlert = (index: number) => {
    Alert.alert("Remove this Media ?", "", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "OK", onPress: () => handleRemoveMedia(index) },
    ]);
  };

  const handleClose = () => {
    setCatModalOpen(false);
    setSizeModalOpen(false);
  };

  const updateCategory = (_category: CategoryProps) => {
    setProCategory(_category);
    setCatModalOpen(false);
  };

  const updateSize = (_size: string) => {
    setSize(_size);
    setSizeModalOpen(false);
  };

  const updateCurrency = (_currency: string) => {
    setCurrency(_currency);
    setCurrencyModalOpen(false);
  };

  const handleUpdateProduct = async () => {
    if (proCategory === null) {
      ToastAndroid.show("Please Select Product Category!", ToastAndroid.SHORT);
      return;
    }

    if (medias.length === 0) {
      ToastAndroid.show("Please Select Product Image!", ToastAndroid.SHORT);
      return;
    }

    if (title === "") {
      ToastAndroid.show("Please Input Product Title!", ToastAndroid.SHORT);
      return;
    }

    if (size === "") {
      ToastAndroid.show("Please Input Product Size!", ToastAndroid.SHORT);
      return;
    }

    if (price === "") {
      ToastAndroid.show("Please Input Product Price!", ToastAndroid.SHORT);
      return;
    }

    if (description === "") {
      ToastAndroid.show(
        "Please Input Product Description!",
        ToastAndroid.SHORT
      );
      return;
    }

    const productData = {
      product_id: product._id,
      medias: medias,
      category_id: proCategory._id,
      title: title,
      size: size,
      price: price,
      currency: currency,
      reduced_price: reducedPrice,
      description: description,
      is_recycle: isRecycle
    };

    setLoading(true);

    try {
      const response = await axios.post(
        convertApiUrl("product/update"),
        productData,
        {
          headers: { "x-access-token": authToken },
        }
      );

      setLoading(false);
      ToastAndroid.show("Product Updated successfully!", ToastAndroid.SHORT);
      updateOwnProduct(response.data.product);
      updateProduct(response.data.product);
      setTimeout(() => {
        handleResetForm();
        navigation.push(`/home/product/${product._id}`)
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      //@ts-ignore
      if (error?.response.status === 400) {
        //@ts-ignore
        ToastAndroid.show( Object.values(error?.response.data)[0],ToastAndroid.SHORT);
      } else {
        //@ts-ignore
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Update Your Product</Text>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingVertical: 15,
            paddingHorizontal: 15,
          }}
          style={{ width: "100%" }}
        >
          <View style={styles.formContainer}>
            {tempMedias.length > 0 ? (
              <PagerView style={styles.mediaSlider} initialPage={0}>
                {tempMedias.map((tempMedia, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {mediaUploadLoading && (
                        <View style={styles.meidaUploadEffect}>
                          <ActivityIndicator size={100} color={"#fff"} />
                        </View>
                      )}
                      <Pressable
                        onLongPress={() => showRemoveMeidaAlert(index)}
                      >
                        {tempMedia.media_type === "image" && (
                          <Image
                            style={{
                              resizeMode: "contain",
                              width: "100%",
                              height: "100%",
                            }}
                            source={{ uri: tempMedia.uri }}
                          />
                        )}
                        {tempMedia.media_type === "video" && (
                          <Video
                            style={styles.video}
                            source={{
                              uri: tempMedia.uri,
                            }}
                            shouldPlay
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping
                          />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </PagerView>
            ) : (
              <></>
            )}
            <TouchableOpacity
              onPress={pickImageAsync}
              style={styles.mediaAddBtn}
            >
              <Feather name="plus" size={20} color="white" />
              <Text>Add Product Image or Video</Text>
            </TouchableOpacity>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product Category</Text>
              <Pressable
                style={styles.categoryBox}
                onPress={() => setCatModalOpen(true)}
              >
                <TextInput
                  placeholderTextColor="rgb(65,65,65)"
                  style={styles.pickerInput}
                  value={proCategory ? proCategory.cat_title : ""}
                  editable={false}
                  placeholder={"Title"}
                />
                <FontAwesome
                  name="sort-down"
                  style={{ marginRight: 5, marginBottom: 8 }}
                  size={24}
                  color="white"
                />
              </Pressable>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product Title</Text>
              <TextInput
                placeholderTextColor="rgb(65,65,65)"
                style={styles.input}
                value={title}
                onChangeText={(title) => setTitle(title)}
                placeholder={"Title"}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product Size</Text>
              <Pressable
                style={styles.categoryBox}
                onPress={() => setSizeModalOpen(true)}
              >
                <TextInput
                  placeholderTextColor="rgb(65,65,65)"
                  style={styles.pickerInput}
                  value={size}
                  editable={false}
                  placeholder={"Size"}
                />
                <FontAwesome
                  style={{ marginRight: 5, marginBottom: 8 }}
                  name="sort-down"
                  size={24}
                  color="white"
                />
              </Pressable>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product Price</Text>
              <TextInput
                placeholderTextColor="rgb(65,65,65)"
                style={styles.input}
                value={price}
                onChangeText={(price) => setPrice(price)}
                placeholder={"Price"}
              />
              <TouchableOpacity onPress={() => setCurrencyModalOpen(true)} style={styles.currencySelect}>
                  <Text style={{marginRight: 10, fontWeight:'bold'}}>{currency}</Text>
                  <FontAwesome
                    style={{ marginRight: 5, marginBottom: 8 }}
                    name="sort-down"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Reduced Price</Text>
              <TextInput
                placeholderTextColor="rgb(65,65,65)"
                style={styles.input}
                value={reducedPrice}
                onChangeText={(_reducedPrice) => setReducedPrice(_reducedPrice)}
                placeholder={"Price"}
              />
            </View>

            <View style={styles.formGroup}>
                <TouchableOpacity onPress={() => setIsRecycle((prev) => !prev)} style={styles.checkboxBtn}>
                  <MaterialIcons name={isRecycle? "check-box": "check-box-outline-blank"} size={30} color={isRecycle? "#edaeff": "#fff"} />
                  <Text style={styles.inputLabelCheck}>Recycle Product?</Text>
                </TouchableOpacity>
              </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product Descriptions</Text>
              <TextInput
                placeholderTextColor="rgb(65,65,65)"
                style={styles.inputArea}
                value={description}
                onChangeText={(description) => setDescription(description)}
                placeholder={"Description"}
                multiline={true}
                numberOfLines={5}
              />
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.push(`/home/product/${product._id}`)}
                disabled={loading}
                style={[styles.button, styles.greyButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProduct}
                disabled={loading}
                style={styles.button}
              >
                {loading && (
                  <ActivityIndicator
                    size={28}
                    style={{ marginRight: 10 }}
                    color={"#fff"}
                  />
                )}
                <Text style={styles.buttonText}>Update Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal animationType="fade" transparent={true} visible={catModalOpen}>
          <View style={styles.modalContainer}>
            <Pressable onPress={handleClose} style={styles.modalOverlay}>
              <View style={styles.modalOverlay}></View>
            </Pressable>

            <View style={styles.modalContent}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Select Category
              </Text>
              <ScrollView
                contentContainerStyle={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalCatItem}
                    onPress={() => updateCategory(category)}
                  >
                    <Text style={styles.modalCatItemText}>
                      {category.cat_title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={sizeModalOpen}>
          <View style={styles.modalContainer}>
            <Pressable onPress={handleClose} style={styles.modalOverlay}>
              <View style={styles.modalOverlay}></View>
            </Pressable>

            <View style={styles.modalContent}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Select Size
              </Text>
              <ScrollView
                contentContainerStyle={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("S")}
                >
                  <Text style={styles.modalCatItemText}>S</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("M")}
                >
                  <Text style={styles.modalCatItemText}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("L")}
                >
                  <Text style={styles.modalCatItemText}>L</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("XL")}
                >
                  <Text style={styles.modalCatItemText}>XL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("XXL")}
                >
                  <Text style={styles.modalCatItemText}>XXL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("XXXL")}
                >
                  <Text style={styles.modalCatItemText}>XXXL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCatItem}
                  onPress={() => updateSize("XXXXL")}
                >
                  <Text style={styles.modalCatItemText}>XXXXL</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
            animationType="fade"
            transparent={true}
            visible={currencyModalOpen}
          >
            <View style={styles.modalContainer}>
              <Pressable onPress={handleClose} style={styles.modalOverlay}>
                <View style={styles.modalOverlay}></View>
              </Pressable>

              <View style={styles.modalContent}>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  Select Currency
                </Text>
                <ScrollView
                  contentContainerStyle={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    style={styles.modalCatItem}
                    onPress={() => updateCurrency("USD")}
                  >
                    <Text style={styles.modalCatItemText}>USD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCatItem}
                    onPress={() => updateCurrency("EUR")}
                  >
                    <Text style={styles.modalCatItemText}>EUR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCatItem}
                    onPress={() => updateCurrency("GBP")}
                  >
                    <Text style={styles.modalCatItemText}>GBP</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  formGroup: {
    width: "100%",
  },
  buttonGroup: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    fontSize: 18,
  },
  inputArea: {
    display: "flex",
    width: "100%",
    height: 150,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    fontSize: 18,
    textAlignVertical: "top",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 5,
    backgroundColor: "#edaeff",
    display: "flex",
    flexDirection: "row",
    height: 50,
    marginTop: 10,
    width: "47%",
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#fff",
  },
  greyButton: {
    backgroundColor: "#ff4b4b",
  },
  mediaAddBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    borderColor: "#fff",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 5,
  },

  mediaSlider: {
    flex: 1,
    height: 200,
  },
  siderItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  meidaUploadEffect: {
    opacity: 0.3,
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: Dimensions.get("window").width - 20,
    height: "100%",
  },
  categoryBox: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 5,
    display: "flex",
    flexDirection: "row",
    padding: 5,
    paddingLeft: 10,
    alignItems: "center",
  },
  pickerInput: {
    borderWidth: 0,
    flex: 1,
    color: "#fff",
    fontSize: 18,
  },
  modalContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    backgroundColor: "#fff",
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    left: 0,
    top: 0,
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    maxHeight: 500,
  },
  modalCatItem: {
    width: "100%",
    height: 50,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  modalCatItemText: {
    fontSize: 18,
  },
  checkboxBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabelCheck: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    marginTop: 5,
    marginLeft: 10,
    fontWeight: 'bold'
  },
  currencySelect: {
    height: 40,
    position: 'absolute',
    bottom: 5,
    right: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 7,
    borderRadius: 5,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
  }
});
