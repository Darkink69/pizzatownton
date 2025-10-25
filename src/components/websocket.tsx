import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import store from '../store/store'

interface WebSocketMessage {
  type: string
  requestId: string
  session: string
  authReq?: {
    referralCode: string | null
    initData: string
  }
  claimDoRq?: {
    telegramId: number
  }
  [key: string]: any
}

function generateRequestId() {
  return Math.random().toString(36).substring(2, 10)
}

const WebSocketComponent = observer(() => {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [lastMessage, setLastMessage] = useState<string>('')

  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')

  const WS_URL =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + '/ws'

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    console.log('🔌 Connecting to WebSocket:', WS_URL)
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      console.log('✅ WebSocket connected')

      const requestId = generateRequestId()

      const authMsg: WebSocketMessage = {
        type: 'AUTH_INIT',
        requestId,
        session: '',
        authReq: {
          referralCode: store.referrerId,
          initData: store.initDataRaw,
        },
      }

      ws.send(JSON.stringify(authMsg))
      console.log('📤 Sent AUTH_INIT:', authMsg)
    }

    ws.onmessage = (event) => {
      console.log('📨 WS message received:', event.data)
      setLastMessage(event.data)

      try {
        const parsed = JSON.parse(event.data)

        switch (parsed.type) {
          case 'AUTH_INIT':
            if (parsed.success) {
              const { user, sessionId } = parsed.data ?? {}
              store.setUser(user)
              store.setSessionId(sessionId)
              console.log('✅ AUTH success:', user)
            } else {
              console.warn('❌ AUTH failed:', parsed.message)
              store.setAuthError(parsed.message)
            }
            break

          case 'CLAIM_DO':
            if (parsed.success) {
              const { userResponse } = parsed.data ?? {}
              store.setUserState(userResponse)
              console.log('💰 CLAIM ok:', userResponse)
            } else {
              console.warn('❌ CLAIM error:', parsed.message)
            }
            break

          default:
            console.log('ℹ️ Unknown message type:', parsed.type)
        }
      } catch (e) {
        console.warn('❗ Failed to parse WS message:', e)
      }
    }

    ws.onerror = (error) => {
      setStatus('error')
      console.error('❌ WebSocket error:', error)
    }

    ws.onclose = (event) => {
      setStatus('disconnected')
      console.warn(`⚠️ WS closed (code: ${event.code}, reason: ${event.reason})`)
      reconnectTimeout.current = setTimeout(() => {
        console.log('🔁 Reconnecting WebSocket...')
        connectWebSocket()
      }, 10000)
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const getReadyStateText = () => {
    if (!wsRef.current) return '-'
    switch (wsRef.current.readyState) {
      case WebSocket.CONNECTING:
        return '⏳ Connecting'
      case WebSocket.OPEN:
        return '🟢 Open'
      case WebSocket.CLOSING:
        return '🟠 Closing'
      case WebSocket.CLOSED:
        return '🔴 Closed'
      default:
        return 'Unknown'
    }
  }

  return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">WebSocket Debug</h1>

        <div className="mb-4">
          <p>Status: <span className={
            status === 'connected' ? 'text-green-600 font-semibold' :
                status === 'error' ? 'text-red-600 font-semibold' :
                    'text-gray-600'
          }>{status}</span></p>
          <p>ReadyState: <span className="text-gray-800">{getReadyStateText()}</span></p>
          <p className="text-gray-500 text-xs">Session: {store.sessionId || '-'}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Last Message:</p>
          <div className="mt-2 p-3 bg-gray-100 rounded border max-h-[200px] overflow-auto">
            {lastMessage ? (
                <code className="text-sm break-all">{lastMessage}</code>
            ) : (
                <span className="text-gray-500">No messages received yet</span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Auto reconnect after 10 sec</p>
          <p>WS URL: <code className="break-all">{WS_URL}</code></p>
        </div>
      </div>
  )
})

export default WebSocketComponent;