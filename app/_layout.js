import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import GlobalAlert from '../components/GlobalAlert';

export default function RootLayout() {
  const router = useRouter();

  // Register service worker on web with update notification support
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);

          // Handle updates
          registration.onupdatefound = () => {
             const installingWorker = registration.installing;
             if (installingWorker) {
               installingWorker.onstatechange = () => {
                 if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // A new service worker is available and waiting
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

      // Refresh when the new service worker takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="authentication" />
        <Stack.Screen name="mainapp" />
      </Stack>
      <GlobalAlert />
    </AuthProvider>
  );
}