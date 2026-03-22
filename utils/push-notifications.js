import { Platform } from 'react-native';
import * as api from '../constants/api';

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_KEY || 'BCkiQ8IJzLA5mt17GoM-bvKJ_uVHee-h-oIgal9AIb682dtlHnXn0qKqWcVinW_18aq9-6fK0m7-8f-Q-QbikAY';

function urlBase64ToUint8Array(base64String) {
  if (!base64String || base64String === 'BML...') {
    console.error('VAPID Public Key is missing or invalid. Please set EXPO_PUBLIC_VAPID_KEY.');
    return null;
  }

  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.error('Failed to decode VAPID public key:', e);
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS !== 'web') {
    console.warn('Push notifications only implemented for Web PWA in this flow.');
    return null;
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Subscribe user
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Send subscription to backend
    await api.updatePushSubscription(subscription);
    console.log('Push subscription registered and sent to backend.');
    return subscription;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return null;
  }
}
