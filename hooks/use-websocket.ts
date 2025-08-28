import { useEffect, useRef, useState, useCallback } from 'react';
import { tokenStorage } from '../lib/api/client';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface NotificationData {
  user_id: number;
  quest_id?: number;
  notif_type: string;
}

interface UseWebSocketOptions {
  onNotification?: (data: NotificationData) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: (event: CloseEvent) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:8080';

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onNotification,
    onError,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const wsUrl = `${WEBSOCKET_URL}/?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'notification') {
            onNotification?.(message.data);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        onDisconnect?.(event);

        // Auto-reconnect logic
        if (shouldReconnectRef.current && autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          const nextAttempt = reconnectAttempts + 1;
          setReconnectAttempts(nextAttempt);
          
          console.log(`Attempting to reconnect (${nextAttempt}/${maxReconnectAttempts}) in ${reconnectInterval}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [onNotification, onError, onConnect, onDisconnect, autoReconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearReconnectTimeout();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, [clearReconnectTimeout]);

  // Auto-connect on mount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, []);

  // Reset reconnect attempts when connection is successful
  useEffect(() => {
    if (isConnected) {
      setReconnectAttempts(0);
    }
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    connect,
    disconnect
  };
}

export default useWebSocket;