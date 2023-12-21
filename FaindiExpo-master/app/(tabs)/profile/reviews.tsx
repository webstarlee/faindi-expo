import React from "react";
import { StyleSheet, Image, Dimensions } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "../../../components/Themed";
import { useProfile } from "../../../hooks/ProfileContext";
import { getCurrencySymbol } from "../../../utils/common";

export default function ReviewsPage() {
  const { feedbacks } = useProfile();
  return (
    <View style={styles.container}>
      {feedbacks.length > 0 && (
        <>
          {feedbacks.map((feedback, index) => {
            return (
              <View key={index} style={styles.singleFeedbackContainer}>
                <View style={styles.productImgBox}>
                  {feedback.product.medias[0].media_type === "image" && (
                    <Image
                      style={styles.productImg}
                      source={{ uri: feedback.product.medias[0].uri }}
                    />
                  )}
                  {feedback.product.medias[0].media_type === "video" && (
                    <Video
                      style={styles.video}
                      source={{
                        uri: feedback.product.medias[0].uri,
                      }}
                      shouldPlay
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                    />
                  )}
                  <Text style={styles.productTitle}>
                    {feedback.product.title.length > 11
                      ? feedback.product.title.substring(0, 11) + "..."
                      : feedback.product.title}
                  </Text>
                  <Text style={styles.productPrice}>
                  {getCurrencySymbol(feedback.product.currency)}{feedback.product.price}
                  </Text>
                </View>
                <View style={styles.feedbackDetailContainer}>
                  <View style={styles.rateStarBox}>
                    <AntDesign
                      name={feedback.rate > 0 ? "star" : "staro"}
                      size={24}
                      color="white"
                    />
                    <AntDesign
                      name={feedback.rate > 1 ? "star" : "staro"}
                      size={24}
                      color="white"
                    />
                    <AntDesign
                      name={feedback.rate > 2 ? "star" : "staro"}
                      size={24}
                      color="white"
                    />
                    <AntDesign
                      name={feedback.rate > 3 ? "star" : "staro"}
                      size={24}
                      color="white"
                    />
                    <AntDesign
                      name={feedback.rate > 4 ? "star" : "staro"}
                      size={24}
                      color="white"
                    />
                  </View>
                  <Text>
                    {feedback.comment.length > 50
                      ? feedback.comment.substring(0, 50) + "..."
                      : feedback.comment}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}
      {feedbacks.length === 0 && (
        <View>
          <Text>No product feedback</Text>
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
  singleFeedbackContainer: {
    width: "100%",
    padding: 10,
    display: "flex",
    flexDirection: "row",
  },
  productImgBox: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 5,
  },
  productImg: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 40,
    resizeMode: "cover",
  },
  video: {
    width: "100%",
    height: (Dimensions.get("window").width * 30) / 100 - 40,
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
  feedbackDetailContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'space-around'
  },
  rateStarBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
