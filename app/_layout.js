import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import GlobalAlert from '../components/GlobalAlert';

// Component to handle service worker messages and toast
function ServiceWorkerHandler({ children }) {
  const { showToast } = useToast();

  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      const handleMessage = (event) => {
        console.log('[App] Message received from SW:', event.data);
        if (event.data && event.data.type === 'SHOW_TOAST') {
          showToast(event.data.payload.title, event.data.payload.body);
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, [showToast]);

  return children;
}

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    // Register service worker on web with update notification support
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);

          registration.onupdatefound = () => {
             const installingWorker = registration.installing;
             if (installingWorker) {
               installingWorker.onstatechange = () => {
                 if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    if (window.confirm('A new version of vasApp is available! Would you like to update now?')) {
                      installingWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                 }
               };
             }
          };
        })
        .catch((err) => console.warn('[SW] Registration failed:', err));

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  // Return a simple loading state or the same structure if not hydrated
  // to avoid large HTML mismatches, but usually rendering null or 
  // the exact server-side HTML is best.
  
  const content = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="authentication" />
      <Stack.Screen name="mainapp" />
    </Stack>
  );

  if (!isHydrated) return content;

  return (
    <AuthProvider>
      <ToastProvider>
        <ServiceWorkerHandler>
          {content}
          <GlobalAlert />
        </ServiceWorkerHandler>
      </ToastProvider>
    </AuthProvider>
  );
}