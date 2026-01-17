# useNotifications Hook - Real-Time Notification System

## Overview
This React hook manages WebSocket connections to the backend notification system, enabling real-time notification delivery and updates.

## Usage

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,      // Array of Notification objects
    socket,            // Socket.io instance
    isConnected,       // Boolean - WebSocket connection status
    unreadCount,       // Number - Count of unread notifications
    markAsRead,        // Function - Mark single notification as read
    markAllAsRead,     // Function - Mark multiple notifications as read
  } = useNotifications();

  // Use these values in your component
}
```

## Features

### 1. **Real-Time Notifications**
- Automatically receives `notification:new` events from backend
- Updates UI without page refresh
- Notifications array is kept in sync

### 2. **Read Status Management**
- `markAsRead(notificationId)` - Mark single notification as read
- `markAllAsRead(notificationIds?)` - Mark multiple as read (or all if no IDs provided)
- Local state updates immediately for better UX

### 3. **Connection Status**
- `isConnected` boolean indicates WebSocket connection state
- Automatic reconnection with exponential backoff
- Connection logs available in browser console

### 4. **WebSocket Events**

#### Received Events:
- `notification:new` - When a new notification is created
  ```json
  {
    "data": {
      "id": 1,
      "title": "Assignment Due",
      "message": "Your assignment is due in 1 hour",
      "type": "ASSIGNMENT",
      "priority": "HIGH",
      "status": "SENT"
    }
  }
  ```

- `notification:read` - When a notification is marked as read
  ```json
  {
    "notificationId": 1
  }
  ```

- `connected` - Confirmation of WebSocket session
  ```json
  {
    "userId": 123,
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

## Configuration

### Backend Connection
The hook connects to: `http://localhost:3333/notifications`

**Requirements:**
- Backend must be running on port 3333
- WebSocket gateway must be active at `/notifications` namespace
- JWT token must be valid and passed in auth header

### Environment Setup
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Or update the connection URL in the hook if needed.

## Console Debugging

The hook logs important events to the browser console:

```
✅ Conectado a notificaciones en tiempo real
  → WebSocket successfully connected

❌ Desconectado de notificaciones
  → WebSocket disconnected

❌ Error de conexión WebSocket: [error]
  → Connection error occurred

📬 Nueva notificación: {...}
  → New notification received

✅ Notificación marcada como leída: [id]
  → Notification marked as read
```

## Integration Example

### NotificationDropdown Component
```typescript
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const { notifications, unreadCount, isConnected, markAsRead } = useNotifications();

  const handleNotificationClick = async (notificationId: number, status: string) => {
    if (status !== 'READ') {
      await markAsRead(notificationId);
    }
  };

  return (
    <div>
      <span className={isConnected ? 'text-green' : 'text-red'}>
        {unreadCount} unread
      </span>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => handleNotificationClick(notif.id, notif.status)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Notifications not appearing in real-time?

1. **Check WebSocket Connection:**
   - Open browser DevTools → Console
   - Look for "✅ Conectado a notificaciones en tiempo real"
   - If you see ❌, check backend is running

2. **Verify Token:**
   - Hook requires valid JWT token from `useAuthStore`
   - Token must be sent in WebSocket auth header
   - Check: `localStorage.getItem('auth-store')` for token

3. **Backend Not Emitting Events?**
   - Verify `NotificationsGatewayService` is injected in `NotificationsService`
   - Check `notifyMultipleUsers()` is called when notification created
   - Review backend console for errors

4. **Network Issues:**
   - Check browser Network tab for WebSocket handshake
   - Look for 101 Switching Protocols response
   - Verify CORS is not blocking WebSocket

### Mark as Read Not Working?

1. **Check API Response:**
   - Open DevTools → Network
   - Filter for PATCH requests to `/api/notifications/`
   - Verify 200 OK response

2. **Verify JWT in Request:**
   - Headers should include: `Authorization: Bearer [token]`
   - Token must be valid and not expired

3. **Check Notification ID:**
   - Ensure correct notificationId is passed to `markAsRead()`
   - ID should be a number, not string

## Architecture

```
useNotifications Hook
  ├── Socket.io Connection (port 3333/notifications)
  ├── Event Listeners
  │   ├── connection → setIsConnected(true)
  │   ├── notification:new → setNotifications([...])
  │   └── notification:read → update notifications status
  ├── Methods
  │   ├── markAsRead(id) → PATCH /api/notifications/{id}/read
  │   └── markAllAsRead(ids) → PATCH /api/notifications/bulk/read
  └── State Management
      ├── notifications[] → Array of notification objects
      ├── isConnected → Boolean
      └── unreadCount → Computed from notifications
```

## Best Practices

1. **Always check `isConnected`** before assuming notifications are available
2. **Handle errors** in `markAsRead()` and `markAllAsRead()` calls
3. **Use the hook only once** per component tree (typically in Header/Layout)
4. **Pass unreadCount** to badge components for UI updates
5. **Subscribe to `notification:new`** for real-time visual cues

## Performance Tips

- The hook automatically cleans up connections on unmount
- Heartbeat ping every 30 seconds keeps connection alive
- Notifications array update is optimized with `setNotifications(prev => ...)`
- Reconnection attempts max out at 5 for stability

## Support

For issues:
1. Check browser console for detailed error messages
2. Verify backend notifications module is running
3. Ensure JWT token is valid and has correct scope
4. Check network connectivity to backend
