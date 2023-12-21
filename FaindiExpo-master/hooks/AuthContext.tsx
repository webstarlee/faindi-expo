import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { ToastAndroid } from "react-native";
import axios from "axios";
import { convertApiUrl } from "../config";
import { useEffectOnce } from "./useEffectOnce";
import { scheduleFlushOperations } from "react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon";
import { getNativeSourceAndFullInitialStatusForLoadAsync } from "expo-av/build/AV";

interface AuthContextValue {
  isAuthenticated: boolean;
  userId: string;
  fullName: string;
  userEmail: string;
  username: string;
  avatar: string;
  cover: string;
  authToken: string;
  title: string;
  bio: string;
  verifyEmail: string;
  verifyToken: string;
  login: (
    userId: string,
    fullName: string,
    userEmail: string,
    username: string,
    avatar: string,
    cover: string,
    authToken: string,
    title: string,
    bio: string
  ) => void;
  logout: () => void;
  updateAvatar: (newAvatar: string) => void;
  updateCover: (newCover: string) => void;
  updateInfo: (_fullname: string, _username: string, _title: string, _bio: string) => void;
  updateVerifyToken: (_token: string) => void;
  updateVerifyEmail: (_email: string) => void;
  updateEmailFullname: (_fullname: string, _email: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsloading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [cover, setCover] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [verifyToken, setVerifyToken] = useState<string>("");
  const [verifyEmail, setVerifyEmail] = useState<string>("");

  const updateVerifyToken = (_token: string) => {
    setVerifyToken(_token);
  };

  const updateVerifyEmail = (_email: string) => {
    setVerifyEmail(_email);
  };

  const updateAuthToken = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    setIsAuthenticated(!!token);
    setAuthToken(token ? token : "");
  };

  useEffectOnce(() => {
    updateAuthToken().catch(console.error);
  });

  const fetchUserInfo = async () => {
    setIsloading(true);
    console.log("fetching user info")
    try {
      const response = await axios.get(convertApiUrl("user/current"), {
        headers: { "x-access-token": authToken },
      });

      console.log("fetching user info 1")

      if (response.data.user) {
        setIsloading(false);
        const user = response.data.user;
        login(
          user.user_id,
          user.fullname,
          user.email,
          user.username,
          user.avatar,
          user.cover,
          authToken,
          user.title,
          user.bio
        );
      }
    } catch (error: any) {
      console.log("fetching user info 2")
      setIsloading(false);
      console.log(error?.response.status);
      if (error?.response.status === 401) {
        logout();
      } else {
        ToastAndroid.show(error?.response.message, ToastAndroid.SHORT);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && authToken && userId === "") {
      console.log("refetch user infromations");
      fetchUserInfo();
    }
  }, [isAuthenticated, authToken, userId]);

  const login = async (
    _userId: string,
    _fullName: string,
    _userEmail: string,
    _username: string,
    _avatar: string,
    _cover: string,
    _authToken: string,
    _title: string,
    _bio: string
  ) => {
    // Perform login logic here, e.g., check credentials, set token, etc.
    // For demonstration purposes, we'll just set isAuthenticated, userId, and name to the provided values.
    setIsAuthenticated(true);
    setUserId(_userId);
    setFullName(_fullName);
    setUserEmail(_userEmail);
    setUsername(_username);
    setAvatar(_avatar);
    setCover(_cover);
    setAuthToken(_authToken);
    setTitle(_title);
    setBio(_bio);

    setIsloading(false);

    await SecureStore.setItemAsync("authToken", _authToken);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUserId("");
    setFullName("");
    setUserEmail("");
    setUsername("");
    setAvatar("");
    setCover("");
    setAuthToken("");
    setTitle("");
    setBio("");
    await SecureStore.deleteItemAsync("authToken");
  };

  const updateAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
  }

  const updateCover = (newCover: string) => {
    setCover(newCover);
  }

  const updateInfo = (_fullname: string, _username: string, _title: string, _bio: string) => {
    setFullName(_fullname)
    setUsername(_username)
    setTitle(_title)
    setBio(_bio)

  }

  const updateEmailFullname = (_fullname: string, _email: string) => {
    setFullName(_fullname);
    setUserEmail(_email);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        fullName,
        userEmail,
        username,
        avatar,
        cover,
        authToken,
        title,
        bio,
        verifyToken,
        verifyEmail,
        login,
        logout,
        updateAvatar,
        updateCover,
        updateInfo,
        updateVerifyToken,
        updateVerifyEmail,
        updateEmailFullname
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useRoot must be used within a RootProvider");
  }
  return context;
}
