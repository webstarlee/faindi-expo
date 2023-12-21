import React from "react";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  useColorScheme,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "../../components/Themed";
import IndexHeader from "../../components/IndexHeader";
import CommonHeader from "../../components/CommonHeader";
import ProfileHeader from "../../components/ProfileHeader";
import Colors from "../../constants/Colors";
import { useAuth } from "../../hooks/AuthContext";
import tempAvatar from "../../assets/images/users/default.png";
import { useChat } from "../../hooks/ChatContext";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>["name"];
  color: string;
  size: number;
}) {
  return <Feather style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { logout, avatar, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const { chats } = useChat()

  const handleOpenLogoutModal = () => {
    if (isAuthenticated) {
      setLogoutModalOpen(true);
    }
  };

  const handleLogOut = () => {
    logout();
    setLogoutModalOpen(false)
  }

  const bageCal = () => {
    if (chats.length> 0) {
      var badgeCount = 0;
      chats.map((chat) => {
        badgeCount += chat.unread_count;
      })
      return badgeCount > 0? badgeCount: undefined; 
    }

    return undefined;
  }

  return (
    <>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          tabBarInactiveBackgroundColor: Colors["dark"].background,
          tabBarActiveBackgroundColor: Colors["dark"].background,
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: "#fff",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors["dark"].background,
            borderTopWidth: 0,
            paddingBottom: 10,
          },
          headerStyle: {
            backgroundColor: "#000",
            borderBottomWidth: 0,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            href: "/home",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="home" size={30} color={color} />
            ),
            headerStyle: {
              backgroundColor: "#000",
            },
            header: () => <IndexHeader />,
          }}
        />

        <Tabs.Screen
          name="peoples"
          options={{
            unmountOnBlur: true,
            href: "/peoples",
            header: () => <CommonHeader />,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="user-plus" size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          listeners={{
            tabLongPress: () => {
              handleOpenLogoutModal();
            },
          }}
          options={{
            unmountOnBlur: true,
            header: () => <ProfileHeader />,
            href: "/profile",
            tabBarIcon: ({ focused }) => (
              <Image
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 30,
                  borderWidth: 2,
                  marginBottom: 10,
                  borderColor: focused ? "#edaeff" : "#ffffff",
                }}
                source={avatar ? { uri: avatar } : tempAvatar}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            header: () => <CommonHeader />,
            href: "/create",
            unmountOnBlur: true,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="plus" size={38} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="messages"
          options={{
            unmountOnBlur: true,
            tabBarBadge: bageCal(),
            href: "/messages",
            header: () => <CommonHeader />,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="message-circle" size={32} color={color} />
            ),
          }}
        />
      </Tabs>

      <Modal animationType="fade" transparent={true} visible={logoutModalOpen}>
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() => setLogoutModalOpen(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.modalOverlay}></View>
          </Pressable>

          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleLogOut} style={styles.logoutModalBtn}>
              <Text style={styles.logoutModalBtnTxt}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLogoutModalOpen(false)} style={styles.logoutModalBtnCancel}>
              <Text style={styles.logoutModalBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    backgroundColor: "#e18ef9",
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
    width: "50%",
    padding: 20,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    maxHeight: 500,
  },
  logoutModalBtn: {
    width: "100%",
    height: 40,
    backgroundColor: "#db3c3c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10
  },
  logoutModalBtnCancel: {
    width: "100%",
    height: 40,
    backgroundColor: "#10c74e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10
  },
  logoutModalBtnTxt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
