import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';

export default function OTPVerification() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await api.activateAccount(email, otp);
      Alert.alert('Success', 'Account activated! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/authentication/login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    try {
      await api.forgotPassword(email);
      setTimer(60);
      Alert.alert('Success', 'A new code has been sent.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(val) => {
            setOtp(val);
            if (val.length === 6) {
              // Auto-submit would go here, but handleVerify handles it
            }
          }}
        />

        <TouchableOpacity 
          style={[styles.verifyBtn, loading && { opacity: 0.7 }]} 
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.verifyBtnText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
          <Text style={[styles.resendText, timer > 0 && { color: Theme.colors.textSecondary }]}>
            {timer > 0 ? `Resend code in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingTop: 80,
  },
  backBtn: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xl * 1.5,
  },
  form: {
    marginTop: Theme.spacing.md,
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: 60,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.xl,
  },
  verifyBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
