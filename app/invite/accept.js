import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function AcceptInvitation() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    } else {
      setError('No invitation token found.');
      setLoading(false);
    }
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const res = await api.verifyInvitation(token);
      setInvitation(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const res = await api.acceptInvitation({ token });
      const data = res.data;

      if (data.status === 'success') {
        if (data.type === 'new_user') {
          Alert.alert(
            'Welcome!',
            'Your account has been created. Please set your password to continue.',
            [{ text: 'Set Password', onPress: () => router.replace({ 
              pathname: '/authentication/set-password', 
              params: { userId: data.userId, email: data.email } 
            }) }]
          );
        } else {
          Alert.alert(
            'Success',
            'You have joined the group!',
            [{ text: 'Go to Dashboard', onPress: () => router.replace('/mainapp/home') }]
          );
        }
      } else if (data.status === 'auth_required') {
        Alert.alert(
          'Login Required',
          data.message,
          [{ text: 'Login', onPress: () => router.push({ 
            pathname: '/authentication/login', 
            params: { email: data.email } 
          }) }]
        );
      } else if (data.status === 'wrong_account') {
        Alert.alert('Error', data.message);
      } else {
        Alert.alert('Error', data.message || 'Failed to process invitation.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Verifying Invitation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color={Theme.colors.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/authentication/login')}>
          <Text style={styles.backBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-open-outline" size={48} color={Theme.colors.primary} />
        </View>
        
        <Text style={styles.title}>You're Invited!</Text>
        <Text style={styles.subtitle}>
          <Text style={{ fontWeight: 'bold' }}>{invitation?.inviterName}</Text> invited you to join their group:
        </Text>
        
        <View style={styles.groupBadge}>
          <Text style={styles.groupName}>{invitation?.groupName}</Text>
        </View>

        <Text style={styles.description}>
          By accepting, you'll be able to share their wallet and manage shared expenses.
        </Text>

        <TouchableOpacity 
          style={[styles.acceptBtn, processing && { opacity: 0.7 }]} 
          onPress={handleAccept}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptBtnText}>Accept Invitation</Text>
          )}
        </TouchableOpacity>

        {!user && (
          <Text style={styles.loginNote}>
            Already have an account? Log in first for a smoother experience.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  groupBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: Theme.spacing.lg,
  },
  groupName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.xl,
  },
  acceptBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Theme.spacing.xl,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  backBtnText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  loginNote: {
    marginTop: Theme.spacing.lg,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  }
});
