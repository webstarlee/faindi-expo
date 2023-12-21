import React from "react";
import axios from "axios";
import {
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "../../../components/Themed";
import { useAuth } from "../../../hooks/AuthContext";
import AuthModal from "../../../components/AuthModal";
import { convertApiUrl } from "../../../config";
import { NotificationProps } from "../../../hooks/types";

export default function Notifications() {
  const { isAuthenticated, userId, authToken } = useAuth();
  const [isFetch, setIsFetch] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    NotificationProps[] | []
  >([]);

  const fetchMyNotifications = async () => {
    try {
      const response = await axios.get(convertApiUrl(`user/notifications`), {
        headers: { "x-access-token": authToken },
      });
      if (response.status === 200) {
        setNotifications(response.data.notifications);
      }
      setIsFetch(true);
    } catch (error: any) {
      setIsFetch(true);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchMyNotifications();
    }
  }, [isAuthenticated, authToken]);

  console.log(notifications);

  return (
    <>
      {isAuthenticated ? (
        <View style={styles.container}>
          {isFetch && userId ? (
            <>
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification, index) => {
                    return (
                      <View key={index} style={styles.singleNotification}>
                        <TouchableOpacity style={styles.avatarBox}>
                          <Image
                            style={styles.avatarImg}
                            source={{ uri: notification.sender.avatar }}
                          />
                        </TouchableOpacity>
                        <View style={styles.notificationDetailBox}>
                          <Text style={styles.notifyDetail}>{notification.content}</Text>
                          {notification.notify_type === "review" && (
                            <View style={styles.starBox}>
                              <AntDesign
                                name={notification.rate > 0 ? "star" : "staro"}
                                size={18}
                                color="white"
                              />
                              <AntDesign
                                name={notification.rate > 1 ? "star" : "staro"}
                                size={18}
                                color="white"
                              />
                              <AntDesign
                                name={notification.rate > 2 ? "star" : "staro"}
                                size={18}
                                color="white"
                              />
                              <AntDesign
                                name={notification.rate > 3 ? "star" : "staro"}
                                size={18}
                                color="white"
                              />
                              <AntDesign
                                name={notification.rate > 4 ? "star" : "staro"}
                                size={18}
                                color="white"
                              />
                            </View>
                          )}
                          {notification.notify_type === "order" && <Text style={{fontWeight: 'bold', fontSize: 15}}>{notification.price}€</Text>}
                        </View>
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text>Notification not found</Text>
              )}
            </>
          ) : (
            <ActivityIndicator size={100} color={"#fff"} />
          )}
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
    alignItems: "center",
    justifyContent: "flex-start",
  },
  singleNotification: {
    width: "100%",
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    borderStyle: "solid",
    display: "flex",
    flexDirection: "row",
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 40,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 40,
  },
  notificationDetailBox: {
    display: "flex",
    paddingLeft: 10,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  starBox: {
    display: "flex",
    flexDirection: "row",
  },
  notifyDetail: {
    fontSize: 15,
    marginBottom: 10
  }
});
