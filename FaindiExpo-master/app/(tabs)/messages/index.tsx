import React from "react";
import { StyleSheet, TouchableOpacity, Image, Pressable } from "react-native";
import { Text, View } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import AuthModal from "../../../components/AuthModal";
import socket from "../../../utils/socket";
import { useChat } from "../../../hooks/ChatContext";
import SearchBar from "../../../components/SearchBar";
import CartBtn from "../../../components/CartBtn";
import { ScrollView } from "react-native-gesture-handler";
import faindiUserImg from "../../../assets/images/faindi_user.png";
import { useRouter } from "expo-router";

export default function MessageScreen() {
  const { isAuthenticated, userId } = useAuth();
  const { chats } = useChat();
  const navigation = useRouter();
  const [mode, setMode] = React.useState("buy");

  const sendMsgToMe = () => {
    socket.emit("message", {
      from_user_id: userId,
      to_user_id: "654e454d84a991d103cfd04d",
      message: "Hello There ?",
      medias: [],
    });
  };

  const updateSearch = (search: string) => {
    console.log(search);
  };

  const sellerChats = React.useMemo(() => {
    return chats?.filter((_chat) => _chat.is_seller);
  }, [chats]);

  const buyerChats = React.useMemo(() => {
    return chats?.filter((_chat) => !_chat.is_seller);
  }, [chats]);

  const msgCut = (msg: string) => {
    const myMsg = msg.replace(/[\n\r]+/g, ' ');
    if (myMsg.length > 30) {
      return myMsg.slice(0, 30)+"..."
    }
    return myMsg
  }

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          <View style={styles.chatHeaderContainer}>
            <View style={styles.headerStyle}>
              <SearchBar updateSearch={updateSearch} />
              <CartBtn />
            </View>
            <View style={styles.toolBtnContainer}>
              <TouchableOpacity
                onPress={() => setMode("buy")}
                style={[
                  styles.toolBtn,
                  mode === "buy" && { backgroundColor: "#edaeff" },
                ]}
              >
                <Text style={styles.toolBtnText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode("sell")}
                style={[
                  styles.toolBtn,
                  mode === "sell" && { backgroundColor: "#edaeff" },
                ]}
              >
                <Text style={styles.toolBtnText}>Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={{ width: "100%" }}>
            {mode === "sell" && (
              <View style={styles.chatListContainer}>
                {sellerChats && sellerChats.length > 0 ? (
                  <>
                    {chats.map((chat, index) => {
                      return (
                        <Pressable
                          onPress={() =>
                            navigation.push(`/messages/chat/${chat.user._id}`)
                          }
                          key={index}
                          style={styles.chatContainer}
                        >
                          <View style={styles.avatarBox}>
                            <Image
                              style={styles.avatarFaindi}
                              source={faindiUserImg}
                            />
                            <Image
                              style={styles.listAvatar}
                              source={{ uri: chat.user.avatar }}
                            />
                          </View>
                          <View style={styles.infoBox}>
                            <Text style={styles.usernameTxt}>
                              @{chat.user.username}
                            </Text>
                            <Text
                              style={[
                                styles.messageTxt,
                                chat.messages[chat.messages.length - 1].is_faindi && { color: "#edaeff" },
                              ]}
                            >
                              {msgCut(chat.messages[chat.messages.length - 1].content)}
                            </Text>
                          </View>
                          {chat.unread_count > 0 && (
                            <View style={styles.badgeBox}>
                              <Text style={styles.badgeText}>
                                {chat.unread_count}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    No chat
                  </Text>
                )}
              </View>
            )}

            {mode === "buy" && (
              <View style={styles.chatListContainer}>
                {buyerChats && buyerChats.length > 0 ? (
                  <>
                    {chats.map((chat, index) => {
                      return (
                        <Pressable
                          onPress={() =>
                            navigation.push(`/messages/chat/${chat.user._id}`)
                          }
                          key={index}
                          style={styles.chatContainer}
                        >
                          <View style={styles.avatarBox}>
                            <Image
                              style={styles.avatarFaindi}
                              source={faindiUserImg}
                            />
                            <Image
                              style={styles.listAvatar}
                              source={{ uri: chat.user.avatar }}
                            />
                          </View>
                          <View style={styles.infoBox}>
                            <Text style={styles.usernameTxt}>
                              @{chat.user.username}
                            </Text>
                            <Text
                              style={[
                                styles.messageTxt,
                                chat.messages[chat.messages.length - 1].is_faindi && { color: "#edaeff" },
                              ]}
                            >
                              {msgCut(chat.messages[chat.messages.length - 1].content)}
                            </Text>
                          </View>
                          {chat.unread_count > 0 && (
                            <View style={styles.badgeBox}>
                              <Text style={styles.badgeText}>
                                {chat.unread_count}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    No chat
                  </Text>
                )}
              </View>
            )}
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
    flex: 1,
  },
  chatHeaderContainer: {
    width: "100%",
  },
  headerStyle: {
    width: "100%",
    backgroundColor: "#000000",
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  modeContainer: {
    width: "100%",
  },
  toolBtnContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolBtn: {
    backgroundColor: "#ddd",
    width: 120,
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
  chatListContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  chatContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    borderStyle: "solid",
    position: "relative",
  },
  avatarBox: {
    width: 60,
    height: 60,
    position: "relative",
  },
  listAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  avatarFaindi: {
    width: 35,
    height: 35,
    position: "absolute",
    zIndex: 1,
    borderRadius: 20,
    top: -7,
    left: -10,
  },
  infoBox: {
    paddingLeft: 15,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  badgeBox: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edaeff",
    position: "absolute",
    right: 0,
    top: 35,
    borderRadius: 20,
  },
  badgeText: {
    color: "#000",
    fontWeight: "bold",
  },
  usernameTxt: {
    fontSize: 14,
    fontWeight: "bold",
  },
  messageTxt: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 3,
  },
});
