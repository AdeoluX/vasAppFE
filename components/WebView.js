import React from 'react';
import { WebView as RNWebView } from 'react-native-webview';

/**
 * Universal WebView component - Native implementation
 * This file is used on iOS and Android.
 */
const WebView = (props) => {
  return <RNWebView {...props} />;
};

export default WebView;
