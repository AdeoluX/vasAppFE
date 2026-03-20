import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../constants/api';

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const { otp, newPassword, confirmPassword } = formData;
    
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword
      });
      Alert.alert('Success', 'Password changed successfully. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/authentication/login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter the code sent to {email} and your new password</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="6-digit Reset Code"
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.otp}
            onChangeText={(val) => updateForm('otp', val)}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="New Password"
            secureTextEntry
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.newPassword}
            onChangeText={(val) => updateForm('newPassword', val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Confirm New Password"
            secureTextEntry
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(val) => updateForm('confirmPassword', val)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.resetBtn, loading && { opacity: 0.7 }]} 
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.resetBtnText}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  input: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 16,
    color: Theme.colors.text,
  },
  resetBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
