import { io } from "socket.io-client";
import { HOST_URL } from "../config";

const socket = io(HOST_URL, { transports: ["websocket"] });
export default socket;
