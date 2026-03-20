import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';

export default function Signup() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSignup = async () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      // Show the OTP Modal to activate the account instead of immediately kicking to login
      setShowOtpModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await api.activateAccount(formData.email, otp);
      setShowOtpModal(false);
      Alert.alert(
        'Success',
        'Account activated successfully! Please login to continue.',
        [{ text: 'Login', onPress: () => router.replace('/authentication/login') }]
      );
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
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

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join vasApp for seamless mobile services</Text>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput 
              style={styles.input} 
              placeholder="First Name"
              placeholderTextColor={Theme.colors.textSecondary}
              value={formData.firstName}
              onChangeText={(val) => updateForm('firstName', val)}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <TextInput 
              style={styles.input} 
              placeholder="Last Name"
              placeholderTextColor={Theme.colors.textSecondary}
              value={formData.lastName}
              onChangeText={(val) => updateForm('lastName', val)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address"
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.email}
            onChangeText={(val) => updateForm('email', val)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Phone Number"
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.phone}
            onChangeText={(val) => updateForm('phone', val)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.password}
            onChangeText={(val) => updateForm('password', val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.textSecondary} />
          <TextInput 
            style={styles.input} 
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor={Theme.colors.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(val) => updateForm('confirmPassword', val)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.signupBtnText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/authentication/login" asChild>
            <TouchableOpacity><Text style={styles.loginLink}>Login</Text></TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activate Account</Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDesc}>
              We've sent a one-time password to <Text style={{fontWeight: 'bold'}}>{formData.email}</Text>. Enter it below to activate your wallet.
            </Text>

            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP (e.g. 123456)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />

            <TouchableOpacity 
              style={[styles.signupBtn, otpLoading && { opacity: 0.7 }]} 
              onPress={handleVerifyOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupBtnText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  errorText: {
    color: Theme.colors.error,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
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
  signupBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  footerText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  modalDesc: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  otpInput: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 56,
    fontSize: 18,
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: Theme.spacing.md,
    fontWeight: 'bold',
  },
});