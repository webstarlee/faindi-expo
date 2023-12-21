import React from "react";
import axios from "axios";
import {
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ToastAndroid,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import socket from "../../../../utils/socket";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import { DateTimeFormatOptions } from "intl";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../../hooks/AuthContext";
import { View, Text } from "../../../../components/Themed";
import { useChat } from "../../../../hooks/ChatContext";
import { useProduct } from "../../../../hooks/ProductContext";
import { ChatProps, MediaProps, MessageProps } from "../../../../hooks/types";
import faindiUserImg from "../../../../assets/images/faindi_user.png";
import { uploadMedia } from "../../../../utils/firebase";
import AuthModal from "../../../../components/AuthModal";
import { convertApiUrl } from "../../../../config";

interface OneMessageProps {
  receiver_id: string;
  sender_id: string;
  is_faindi: boolean;
  is_read: boolean;
  content: string;
  medias: MediaProps[] | [];
  created_at: string;
}

export default function UserChat() {
  const navigation = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated, userId, username, avatar, authToken } = useAuth();
  const { chats, updateChatData, checkMessageRead, removeRateMessage, addMessageChat } = useChat();
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const { products } = useProduct();
  const [isSending, setIsSending] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [medias, setMedias] = React.useState<MediaProps[] | []>([]);
  const [rate, setRate] = React.useState(0);
  const [rateComment, setRateComment] = React.useState("");

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollViewRef.current!.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.push("/home");
    }
  }, [isAuthenticated]);

  const chat = React.useMemo(() => {
    return chats?.filter(
      (_chat) => _chat.user._id.toString() === id?.toString()
    )[0];
  }, [chats, id]);

  const randomUserProduct = React.useMemo(() => {
    return products?.filter(
      (_product) => _product.owner._id.toString() === id?.toString()
    )[0];
  }, [products, id]);

  const user = React.useMemo(() => {
    if (chat) {
      return chat.user;
    } else if (randomUserProduct) {
      return randomUserProduct.owner;
    } else {
      return undefined;
    }
  }, [chat, randomUserProduct]);

  React.useEffect(() => {
    if (chat && userId) {
      checkMessageRead(chat.user);
      socket.emit("readmessage", {
        from_user_id: userId,
        to_user_id: chat.user._id,
      });
    }
  }, [chat, userId]);

  const changeDateFormat = (_date: string) => {
    const originalDate = new Date(_date);
    const options: DateTimeFormatOptions = {
      year: "2-digit",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "UTC",
    };

    const formattedDate = originalDate.toLocaleString("en-US", options);

    return formattedDate;
  };

  const pickImageAsync = async () => {
    Keyboard.dismiss();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const _media = {
        media_type: result.assets[0].type || "image",
        uri: result.assets[0].uri as string,
      };
      setMedias([_media, ...medias]);
    } else {
      ToastAndroid.show("You didn't selected image!", ToastAndroid.SHORT);
    }
  };

  const handleRemoveMedia = (index: number) => {
    let tempMedia = [...medias];
    tempMedia.splice(index, 1);
    setMedias(tempMedia);
  };

  const handleSendMessage = async () => {
    if ((content || medias.length > 0) && user && userId) {
      setIsSending(true);
      const _message: MessageProps = {
        receiver_id: user._id,
        sender_id: userId,
        is_faindi: false,
        is_read: true,
        content: content,
        medias: medias,
        created_at: new Date().toISOString(),
      };
      var singleChat: ChatProps = {
        user: user,
        messages: [_message],
        updated_at: new Date().toISOString(),
        unread_count: 0,
        is_seller: false,
      };

      if (chat) {
        singleChat.messages = [...chat.messages, _message];
        singleChat.is_seller = chat.is_seller;
      }

      updateChatData(singleChat);

      setContent("");

      let tmpMedias: MediaProps[] = [];
      if (medias.length > 0) {
        tmpMedias = await Promise.all([
          ...medias?.map(async (attach) => {
            const media_uri = await uploadMedia("chat", attach.uri);
            const single_media = {
              media_type: attach.media_type,
              uri: media_uri as string,
            };
            return single_media;
          }),
        ]);
      }

      setMedias([]);

      const _final_message = {
        to_user_id: user._id,
        from_user_id: userId,
        message: content,
        medias: tmpMedias,
      };

      socket.emit("message", _final_message);
      setIsSending(false);
    }
  };

  const handleSendReview = async (product_id: string, user_id: string) => {
    if (rate === 0) {
      ToastAndroid.show("Please set the star!", ToastAndroid.SHORT);
      return;
    }

    if (rateComment === "") {
      ToastAndroid.show("Please give me review!", ToastAndroid.SHORT);
      return;
    }

    if (product_id === "") {
      ToastAndroid.show("Can not find Product!", ToastAndroid.SHORT);
      return;
    }

    ToastAndroid.show("you set your review!", ToastAndroid.SHORT);

    const messageContent = `The buyer left feedback: ${rate} star: ${rateComment}`;

    const new_message: MessageProps = {
      receiver_id: userId,
      sender_id: "Faindi",
      is_faindi: true,
      is_rate: false,
      is_read: true,
      content: messageContent,
      medias: [],
      created_at: new Date().toISOString(),
    };

    addMessageChat(user_id, new_message);
    removeRateMessage(user_id);

    try {
      await axios.post(
        convertApiUrl("product/feedback"),
        { product_id: product_id, rate: rate, comment: rateComment },
        {
          headers: { "x-access-token": authToken },
        }
      );
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.chatHeaderContainer}>
        <View style={styles.avatarBox}>
          <Image style={styles.avatarFaindi} source={faindiUserImg} />
          <Image
            style={styles.listAvatar}
            source={user ? { uri: user.avatar } : faindiUserImg}
          />
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.usernameTxt}>Group Chat</Text>
          <Text style={styles.messageTxt}>
            @FAINDI &nbsp;@{username} &nbsp;@{user?.username}
          </Text>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current!.scrollToEnd({ animated: true })
        }
        style={styles.messagesContainerScroll}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 30,
          paddingBottom: 10,
        }}
      >
        <View style={styles.firstMessageContainer}>
          <Image style={styles.msgAvatarFaindi} source={faindiUserImg} />
          <Text style={styles.firstMessageText}>
            Please use the app's payment system for safe transactions. No
            payments outside the app are allowed. A representative from our app
            will always be included in your chat for your safety. Thank you for
            using our app and enjoy!
          </Text>
        </View>

        {chat?.messages.length > 0 && (
          <>
            {chat?.messages.map((message, index) => {
              if (message.is_faindi) {
                if (message.is_rate) {
                  const productId: string = message.product_id || "";
                  return (
                    <View key={index} style={styles.fromMessageContainer}>
                      <Image
                        style={styles.faindiAvatar}
                        source={faindiUserImg}
                      />
                      <View style={styles.dateBox}>
                        <Text style={styles.dateBoxText}>
                          December 8th, 2022 12:11
                        </Text>
                      </View>
                      <View style={styles.faindiRateContentBox}>
                        <Text style={styles.contentText}>
                          Notification -Yay! 😍 Your purchase is complete! ✅
                          {"\n"}
                          Would you be kind enough to rate your experience with
                          the seller to help them succeed? Thank you for using
                          FAINDI!
                        </Text>
                        <View style={styles.rateStarContainer}>
                          <TouchableOpacity onPress={() => setRate(1)} style={{ marginHorizontal: 2 }}>
                            <AntDesign name={rate > 0? "star" : "staro"} size={36} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setRate(2)} style={{ marginHorizontal: 2 }}>
                            <AntDesign name={rate > 1? "star" : "staro"} size={36} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setRate(3)} style={{ marginHorizontal: 2 }}>
                            <AntDesign name={rate > 2? "star" : "staro"} size={36} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setRate(4)} style={{ marginHorizontal: 2 }}>
                            <AntDesign name={rate > 3? "star" : "staro"} size={36} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setRate(5)} style={{ marginHorizontal: 2 }}>
                            <AntDesign name={rate > 4? "star" : "staro"} size={36} color="white" />
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          placeholderTextColor="rgb(65,65,65)"
                          style={styles.rateInput}
                          value={rateComment}
                          multiline={true}
                          onChangeText={(_rateComment) => setRateComment(_rateComment)}
                          placeholder={"Write a message"}
                        />
                        <TouchableOpacity onPress={() => handleSendReview(productId, chat.user._id)} style={styles.reviewMakeBtn}>
                          <Text style={{ color: "#000" }}>Make Review</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                } else {
                  return (
                    <View key={index} style={styles.fromMessageContainer}>
                      <Image style={styles.faindiAvatar} source={faindiUserImg} />
                      <View style={styles.dateBox}>
                        <Text style={styles.dateBoxText}>
                          {changeDateFormat(message.created_at.toString())}
                        </Text>
                      </View>
                      <View style={styles.faindiContentBox}>
                        {message.content && (
                          <Text style={styles.contentText}>
                            Notification - {message.content}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                }
              } else if (message.sender_id.toString() === userId.toString()) {
                return (
                  <View key={index} style={styles.toMessageContainer}>
                    <Image
                      style={styles.myAvatar}
                      source={avatar ? { uri: avatar } : faindiUserImg}
                    />
                    <View style={styles.dateBox}>
                      <Text style={styles.dateBoxText}>
                        {changeDateFormat(message.created_at.toString())}
                      </Text>
                    </View>
                    <View style={styles.contentBox}>
                      {message.medias && (
                        <>
                          {message.medias.map((_media, index) => {
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.contentMediasContainer,
                                  index > 0 && { marginTop: 10 },
                                ]}
                              >
                                {_media.media_type === "image" && (
                                  <Image
                                    style={styles.contentMediaImg}
                                    source={{ uri: _media.uri }}
                                  />
                                )}
                                {_media.media_type === "video" && (
                                  <Video
                                    style={styles.contentMediaVideo}
                                    source={{
                                      uri: _media.uri,
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
                        </>
                      )}
                      {message.content && (
                        <Text style={styles.contentText}>
                          {message.content}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              } else {
                return (
                  <View key={index} style={styles.fromMessageContainer}>
                    <Image
                      style={styles.fromAvatar}
                      source={
                        user?.avatar ? { uri: user?.avatar } : faindiUserImg
                      }
                    />
                    <View style={styles.dateBox}>
                      <Text style={styles.dateBoxText}>
                        {changeDateFormat(message.created_at.toString())}
                      </Text>
                    </View>
                    <View style={styles.fromContentBox}>
                      {message.medias && (
                        <>
                          {message.medias.map((_media, index) => {
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.contentMediasContainer,
                                  index > 0 && { marginTop: 10 },
                                ]}
                              >
                                {_media.media_type === "image" && (
                                  <Image
                                    style={styles.contentMediaImg}
                                    source={{ uri: _media.uri }}
                                  />
                                )}
                                {_media.media_type === "video" && (
                                  <Video
                                    style={styles.contentMediaVideo}
                                    source={{
                                      uri: _media.uri,
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
                        </>
                      )}
                      {message.content && (
                        <Text style={styles.contentText}>
                          {message.content}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
            })}
          </>
        )}
      </ScrollView>
      {medias.length > 0 && !isSending && (
        <View style={styles.mediaContainer}>
          <ScrollView horizontal={true}>
            {medias.map((_media, index) => {
              return (
                <View key={index} style={styles.chatMediaBox}>
                  <TouchableOpacity
                    onPress={() => handleRemoveMedia(index)}
                    style={styles.mediaRemoveBtn}
                  >
                    <AntDesign name="closecircle" size={26} color="#ff5656" />
                  </TouchableOpacity>
                  {_media.media_type === "image" && (
                    <Image
                      style={styles.mediaImg}
                      source={{ uri: _media.uri }}
                    />
                  )}
                  {_media.media_type === "video" && (
                    <Video
                      style={styles.mediaVideo}
                      source={{
                        uri: _media.uri,
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
          </ScrollView>
        </View>
      )}
      <View style={styles.chatControllContainer}>
        <View style={styles.attachmentControllBox}>
          <TouchableOpacity onPress={pickImageAsync}>
            <Entypo name="attachment" size={24} color="#edaeff" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputControllBox}>
          <TextInput
            placeholderTextColor="rgb(65,65,65)"
            style={styles.messageInput}
            value={content}
            multiline={true}
            onChangeText={(_content) => setContent(_content)}
            placeholder={"Write a message"}
            numberOfLines={5}
          />
        </View>
        <View style={styles.sendConvrollBox}>
          <TouchableOpacity onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#edaeff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ width: "100%", height: 18 }}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  chatHeaderContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    padding: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    position: "relative",
  },
  listAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarFaindi: {
    width: 40,
    height: 40,
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    top: -7,
    left: -10,
  },
  infoBox: {
    paddingLeft: 15,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    flex: 1,
  },
  usernameTxt: {
    width: "100%",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
  messageTxt: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatControllContainer: {
    width: "100%",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "row",
    borderTopColor: "#2a2a2a",
    borderTopWidth: 1,
    borderStyle: "solid",
  },
  attachmentControllBox: {
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  inputControllBox: {
    flex: 1,
    height: "100%",
    backgroundColor: "#000",
  },
  sendConvrollBox: {
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  messageInput: {
    borderWidth: 0,
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  messagesContainerScroll: {
    flex: 1,
  },
  firstMessageContainer: {
    backgroundColor: "#c2b3e2",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 20,
    position: "relative",
    marginBottom: 40,
  },
  firstMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  msgAvatarFaindi: {
    width: 50,
    height: 50,
    position: "absolute",
    zIndex: 1,
    top: -30,
    left: -8,
  },
  toMessageContainer: {
    width: "100%",
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    paddingVertical: 10,
  },
  fromMessageContainer: {
    width: "100%",
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  dateBox: {
    width: "85%",
    display: "flex",
    padding: 5,
    alignItems: "center",
  },
  dateBoxText: {
    color: "#ddd",
  },
  contentBox: {
    width: "85%",
    backgroundColor: "#797979",
    display: "flex",
    paddingVertical: 20,
    paddingLeft: 10,
    paddingRight: 30,
    alignItems: "center",
    borderRadius: 40,
  },
  fromContentBox: {
    width: "85%",
    backgroundColor: "#3e3d42",
    display: "flex",
    paddingVertical: 20,
    paddingLeft: 10,
    paddingRight: 30,
    alignItems: "center",
    borderRadius: 40,
  },
  faindiContentBox: {
    width: "85%",
    backgroundColor: "#c3b4e2",
    display: "flex",
    paddingVertical: 20,
    paddingLeft: 30,
    paddingRight: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  myAvatar: {
    width: 60,
    height: 60,
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    right: 0,
    top: 0,
  },
  fromAvatar: {
    width: 60,
    height: 60,
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    left: 0,
    top: 0,
  },
  faindiAvatar: {
    width: 50,
    height: 50,
    position: "absolute",
    zIndex: 1,
    borderRadius: 30,
    left: 0,
    top: 5,
  },
  contentText: {
    textAlign: "center",
  },
  mediaContainer: {
    width: "100%",
    height: 200,
  },
  chatMediaBox: {
    height: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: "relative",
  },
  mediaImg: {
    width: 200,
    height: "100%",
  },
  mediaVideo: {
    width: 200,
    height: "100%",
  },
  mediaRemoveBtn: {
    width: 30,
    height: 30,
    position: "absolute",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    left: 10,
  },
  contentMediaImg: {
    width: "100%",
    height: (Dimensions.get("window").width * 85) / 100 - 40,
    borderRadius: 20,
  },
  contentMediaVideo: {
    width: "100%",
    height: (Dimensions.get("window").width * 85) / 100 - 40,
  },
  contentMediasContainer: {
    width: "100%",
    height: (Dimensions.get("window").width * 85) / 100 - 40,
    backgroundColor: "transparent",
  },
  faindiRateContentBox: {
    width: "85%",
    backgroundColor: "#c3b4e2",
    display: "flex",
    paddingVertical: 20,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  rateStarContainer: {
    width: "100%",
    backgroundColor: "#c3b4e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 10,
  },
  rateInput: {
    backgroundColor: "#ddd",
    width: "100%",
    height: 100,
    textAlignVertical: "top",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  reviewMakeBtn: {
    width: "100%",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 10,
  },
});
