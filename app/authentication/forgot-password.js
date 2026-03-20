import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../constants/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      Alert.alert('Success', 'A reset code has been sent to your email.', [
        { text: 'OK', onPress: () => router.push({ pathname: '/authentication/reset-password', params: { email } }) }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Email not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a password reset code</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address"
            placeholderTextColor={Theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSendCode}
          disabled={loading}
        >
          <Text style={styles.sendBtnText}>
            {loading ? 'Sending...' : 'Send Reset Code'}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 56,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  input: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 16,
    color: Theme.colors.text,
  },
  sendBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
