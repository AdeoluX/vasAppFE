import { Redirect } from 'expo-router';

/**
 * Root index — immediately redirects to the splash screen.
 * This creates a proper dist/index.html with the Expo JS bundle included,
 * ensuring the PWA has a working entry point on web.
 */
export default function Index() {
  return <Redirect href="/splash" />;
}
