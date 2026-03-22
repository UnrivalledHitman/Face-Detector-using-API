import { io } from "socket.io-client";
import { WS_URL } from "../../config";

export const createRealtimeConnection = ({ onEntryUpdated }) => {
  const socket = io(WS_URL);
  socket.on("entryUpdated", onEntryUpdated);
  return socket;
};
