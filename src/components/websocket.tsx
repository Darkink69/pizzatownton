import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import store from '../store/store';

interface WebSocketMessage {
  type: string;
  requestId: string;
  session: string;
  authReq?: {
    referralCode: number;
    initData: string;
  };
  [key: string]: any;
}

const WebSocketComponent = observer(() => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      // Закрываем предыдущее соединение
      if (wsRef.current) {
        wsRef.current.close();
      }

      // const ws = new WebSocket('wss://echo.websocket.org');
      const ws = new WebSocket(import.meta.env.VITE_API_URL + "/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        console.log('WebSocket connected');

        // Отправляем сообщение
        const message: WebSocketMessage = {
          type: "AUTH_INIT",
          requestId: "",
          session: "",
          authReq: {
            referralCode: 111111,
            initData: store.initDataRaw
            // initData: "user=%7B%22id%22%3A813012401%2C%22first_name%22%3A%22Wowa%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fsuxwv-xayl6LkQDl3kF8Cv8zMVLf88FUSFHhWTbdECU.svg%22%7D&chat_instance=5777142800206997280&chat_type=sender&auth_date=1755613769&signature=xJp1lVXDCJeo_LB5zjUgy1X2B4090X9O7obhbXFLsG6GKvZKBM6UBBFS-RMoBfj0bpu5eCoQkIfaz1tvWGK5Ag&hash=c5dde5cb292646f905f31c614d8db66e14d0817cdd4d143d0c9642070b7a461f"
          }
        };

        ws.send(JSON.stringify(message));
        console.log('Message sent:', message);
      };

      ws.onmessage = (event) => {
        const message = `Received: ${event.data}`;
        setLastMessage(message);
        console.log('Message received:', event.data);
      };

      ws.onerror = (error) => {
        setStatus('error');
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        console.log('WebSocket disconnected');
      };
    };

    // Создаем первое соединение
    connectWebSocket();

    // Устанавливаем интервал для обновления соединения каждые 5 секунд
    const interval = setInterval(() => {
      console.log('Refreshing WebSocket connection...');
      connectWebSocket();
    }, 500000);

    // Очистка при размонтировании компонента
    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Test</h1>
      
      <div className="mb-4">
        <p>Status: <span className={
          status === 'connected' ? 'text-green-600 font-semibold' : 
          status === 'error' ? 'text-red-600 font-semibold' : 'text-gray-600'
        }>{status}</span></p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Last Message:</p>
        <div className="mt-2 p-3 bg-gray-100 rounded border">
          {lastMessage ? (
            <code className="text-sm break-all">{lastMessage}</code>
          ) : (
            <span className="text-gray-500">No messages received yet</span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Connection refreshes every 5 seconds</p>
      </div>
    </div>
  );
})

export default WebSocketComponent;
