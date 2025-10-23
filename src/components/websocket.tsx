import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
// import store from "../store/store";

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
    const initialData = {
      telegramId: "",
      token: "",
      session: "",
      raw_data:
        "user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_namuser=%7B%22id%22%3A813012401%2C%22first_name%22%3A%22Wowa%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fsuxwv-xayl6LkQDl3kF8Cv8zMVLf88FUSFHhWTbdECU.svg%22%7D&chat_instance=5777142800206997280&chat_type=sender&auth_date=1761189491&signature=oAjM2dSjXtTGwG3D2aC5bXWcTRJe9XFACX9hcR7DC7XZLuqtYHBUScM_dwJcOJJFA0eE7QqiGPxqPrJ9VAFKCw&hash=51f243ad9ca3e1ace22202d40cf019c37cbddfb291a9612e7ace92df6a50a021",
      request_id: "",
    };

    ws.send(JSON.stringify(initialData));
  };

  return null;
});

export default WebSocketComponent;
