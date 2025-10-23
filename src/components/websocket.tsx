import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import store from "../store/store";

interface User {
  id: number;
  firstName: string;
  languageCode: string;
}

interface WebSocketMessage {
  endpoint: string;
  payload: User;
}

export const WebSocketComponent = observer(() => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_API_URL + "/ws");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      sendUserRequest(ws);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);

      console.log(response.coins, "response.coins!!");
      if (response.coins !== undefined) {
        console.log(response.coins, "response.coins!!");
      }

      console.log("Received:", response);

      if (!isInitialized && response.result) {
        setIsInitialized(true);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected");
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);

    setSocket(ws);
    console.log(socket);

    return () => {
      ws.close();
    };
  }, []);

  const sendUserRequest = (ws: WebSocket) => {
    const message: WebSocketMessage = {
      endpoint: "user/info",
      payload: {
        id: store.user?.id || 0,
        firstName: store.user?.first_name || "firstName",
        languageCode: store.user?.language_code || "ru",
      },
    };

    ws.send(JSON.stringify(message));
  };

  return null;
});

export default WebSocketComponent;
