import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Universal WebView component - Web implementation
 * This file is used on the Web platform.
 */
const WebView = ({ source, style, onMessage, injectedJavaScript }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!source || !source.uri || !containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.src = source.uri;
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.title = 'WebView Content';
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);

    // Basic message handling if needed (limited for iframes due to CORS)
    const handleMessage = (e) => {
      if (onMessage) {
        onMessage({ nativeEvent: { data: e.data } });
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [source, onMessage]);

  return (
    <View ref={containerRef} style={[styles.container, style]} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default WebView;
