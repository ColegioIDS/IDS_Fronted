/**
 * src/components/debug/CookieDebugger.tsx
 * 
 * Componente para debuggear cookies y autenticación
 */

export function CookieDebugger() {
  const checkAuth = () => {
    console.clear();
    console.log('🔍 === VERIFICACIÓN DE AUTENTICACIÓN ===');
    
    // Cookies
    console.log('\n📦 COOKIES:');
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      console.log(`   ${name}: ${value ? '✅ Existe' : '❌ Vacío'}`);
    }
    
    // LocalStorage
    console.log('\n💾 LOCALSTORAGE:');
    const token = localStorage.getItem('token');
    console.log(`   token: ${token ? '✅ Existe' : '❌ No existe'}`);
    
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log(`   auth-storage: ✅ Existe (tiene token: ${!!parsed.state?.token || !!parsed.token})`);
      } catch {
        console.log(`   auth-storage: ⚠️ No se puede parsear`);
      }
    } else {
      console.log(`   auth-storage: ❌ No existe`);
    }
    
    console.log('\n✅ Verifica la consola para más detalles');
  };

  return (
    <button
      onClick={checkAuth}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 9999,
      }}
    >
      🔍 Debug Auth
    </button>
  );
}
