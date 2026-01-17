// Script para debugging de WebSocket - Copia y pega en la consola del navegador

console.log('%c🔍 WEBSOCKET DEBUGGING TOOL', 'font-size: 14px; font-weight: bold; color: #0066cc;');
console.log('');

// 1. Verificar token
console.log('%c1️⃣ VERIFICAR TOKEN', 'font-weight: bold; color: #ff6600;');
const token = localStorage.getItem('token');
const authStorage = localStorage.getItem('auth-storage');
console.log('localStorage.token:', token ? '✅ Existe' : '❌ No existe');
console.log('localStorage.auth-storage:', authStorage ? '✅ Existe' : '❌ No existe');
if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage);
    console.log('Token en auth-storage:', parsed.state?.token ? '✅ Existe' : '❌ No existe');
  } catch (e) {
    console.log('Error al parsear auth-storage:', e);
  }
}
console.log('');

// 2. Verificar cookies
console.log('%c2️⃣ VERIFICAR COOKIES', 'font-weight: bold; color: #ff6600;');
const cookies = document.cookie.split(';');
console.log('Cookies encontradas:', cookies.length);
cookies.forEach((cookie, i) => {
  const [name, value] = cookie.trim().split('=');
  if (value) {
    console.log(`  ${i + 1}. ${name}: ${value.substring(0, 30)}...`);
  }
});
console.log('');

// 3. Intentar conectar manualmente
console.log('%c3️⃣ INTENTANDO CONECTAR WEBSOCKET', 'font-weight: bold; color: #ff6600;');
console.log('Cargando Socket.io...');

const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.js';
script.onload = function() {
  console.log('✅ Socket.io cargado');
  
  const testToken = localStorage.getItem('token') || 'no-token';
  
  const testSocket = io('http://localhost:3333/notifications', {
    auth: {
      Authorization: `Bearer ${testToken}`,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 3,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  testSocket.on('connect', () => {
    console.log('%c✅ CONECTADO A WEBSOCKET', 'color: #00aa00; font-weight: bold;');
    console.log('Socket ID:', testSocket.id);
  });

  testSocket.on('disconnect', (reason) => {
    console.log('%c❌ DESCONECTADO', 'color: #aa0000; font-weight: bold;');
    console.log('Razón:', reason);
  });

  testSocket.on('connect_error', (error) => {
    console.log('%c❌ ERROR DE CONEXIÓN', 'color: #aa0000; font-weight: bold;');
    console.log('Error:', error.message);
    console.log('Código:', error);
  });

  testSocket.on('connected', (data) => {
    console.log('%c✅ SESIÓN INICIADA', 'color: #00aa00; font-weight: bold;');
    console.log('Datos:', data);
  });

  window.testSocket = testSocket;
  console.log('Instancia guardada en window.testSocket');
};

document.head.appendChild(script);

console.log('');
console.log('%c📝 PRÓXIMOS PASOS:', 'font-weight: bold; color: #0066cc;');
console.log('1. Verifica si el token existe');
console.log('2. Verifica las cookies');
console.log('3. Espera a que se conecte el WebSocket');
console.log('4. Si falla, revisa el error en la consola');
console.log('5. En el backend, verifica: npm run start:dev');
