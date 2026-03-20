import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import GlobalAlert from '../components/GlobalAlert';

export default function RootLayout() {
  const router = useRouter();

  // Register service worker on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.warn('[SW] Registration failed:', err));
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