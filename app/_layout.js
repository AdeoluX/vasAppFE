import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import GlobalAlert from '../components/GlobalAlert';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/splash');
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