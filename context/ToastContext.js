import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { Theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback((title, body, type = 'info') => {
    setToast({ title, body, type });
    
    // Slide in
    Animated.spring(slideAnim, {
      toValue: 20,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideToast();
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={[styles.toast, styles[toast.type] || styles.info]}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={toast.type === 'info' ? 'notifications' : 'alert-circle'} 
                size={24} 
                color="#fff" 
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{toast.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{toast.body}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

// Simple wrapper for TouchableOpacity to avoid import issues in this file
const TouchableOpacity = ({ children, onPress, style }) => (
  <View onStartShouldSetResponder={() => { onPress(); return true; }} style={style}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  info: {
    backgroundColor: Theme.colors.primary,
  },
  success: {
    backgroundColor: '#10B981',
  },
  error: {
    backgroundColor: Theme.colors.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  body: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
  }
});

export const useToast = () => useContext(ToastContext);
