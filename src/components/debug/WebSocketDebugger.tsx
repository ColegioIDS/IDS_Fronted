// src/components/debug/WebSocketDebugger.tsx
"use client";

import { useEffect, useState } from "react";
import { useNotificationsContext } from "@/context/NotificationsContext";

export function WebSocketDebugger() {
  // ✅ SEGURIDAD: Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const { socket, notifications, unreadCount } = useNotificationsContext();
  const [wsStatus, setWsStatus] = useState<string>("Cargando...");

  // Usar socket?.connected como fuente de verdad
  const actuallyConnected = socket?.connected ?? false;

  useEffect(() => {
    const updateStatus = () => {
      const status = `
🔌 ESTADO DEL WEBSOCKET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Conectado: ${actuallyConnected ? "✅ SÍ" : "❌ NO"}
✓ Socket ID: ${socket?.id || "No disponible"}
✓ Socket conectado: ${socket?.connected ? "✅ SÍ" : "❌ NO"}
✓ Transporte: ${socket?.io?.engine?.transport?.name || "Desconocido"}
✓ Notificaciones cargadas: ${notifications.length}
✓ No leídas: ${unreadCount}
✓ URL del servidor: ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Si no está conectado:
1. Abre DevTools → Console
2. Busca logs rojos de "Error de conexión"
3. Verifica que estés logueado
4. Recarga la página

🧪 Para probar:
1. Crea una notificación desde Postman/Admin
2. Deberías verla aquí sin recargar
3. Si no aparece, el WebSocket no está recibiendo eventos
      `.trim();

      setWsStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [actuallyConnected, socket?.id, notifications.length, unreadCount]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "70px",
        right: "10px",
        maxWidth: "300px",
        maxHeight: "400px",
        backgroundColor: actuallyConnected ? "#1a3a1a" : "#3a1a1a",
        color: actuallyConnected ? "#4ade80" : "#ff6b6b",
        border: `2px solid ${actuallyConnected ? "#4ade80" : "#ff6b6b"}`,
        borderRadius: "8px",
        padding: "12px",
        fontFamily: "monospace",
        fontSize: "11px",
        whiteSpace: "pre-wrap",
        overflowY: "auto",
        zIndex: 9998,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      }}
    >
      {wsStatus}
    </div>
  );
}
