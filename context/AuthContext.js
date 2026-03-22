import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../constants/api';
import { registerForPushNotificationsAsync } from '../utils/push-notifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app launch
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
          
          // Register for push notifications after restoration
          setTimeout(() => {
            registerForPushNotificationsAsync().catch(err => console.error('Push reg error:', err));
          }, 2000);

          // Silently refresh profile
          try {
            const profile = await api.getProfile(storedToken);
            const userData = profile.data;
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to refresh profile:', error);
            if (error.response?.status === 401) {
              // Should attempt refresh here in a real app
              logout();
            }
          }
        }
      } catch (e) {
        console.error('Failed to load storage data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const { token, ...userData } = response.data;

      await AsyncStorage.setItem('access_token', token.access_token);
      await AsyncStorage.setItem('refresh_token', token.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(token.access_token);
      setUser(userData);
      setIsLoggedIn(true);

      // Register for push notifications successfully
      setTimeout(() => {
        registerForPushNotificationsAsync().catch(err => console.error('Push reg error:', err));
      }, 1000);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      // Depending on API, we might want to login automatically after registration
      // For now, just return the response
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);