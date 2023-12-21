import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmq-6n8v2_LTDdGaXZ3SDgQhjPTV7OShY",
  authDomain: "faindit-webstar-lee.firebaseapp.com",
  projectId: "faindit-webstar-lee",
  storageBucket: "faindit-webstar-lee.appspot.com",
  messagingSenderId: "212227053874",
  appId: "1:212227053874:web:6e3b3056bced0fea2edf2b",
  measurementId: "G-2B3DGGWBWC"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadMedia(filename: string, uri: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, filename + "/" + new Date().getTime());
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // listen for events
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          // handle error
          reject(error);
        },
        async () => {
          const res = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(res);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export { uploadMedia, storage };
