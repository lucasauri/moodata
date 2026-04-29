import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoginScreen from './LoginScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

function MainApp() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-agro-green-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return <App currentUser={user} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  </React.StrictMode>
);
