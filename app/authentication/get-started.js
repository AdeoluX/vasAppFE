import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { assets } from '../../constants/assets';

const { height, width } = Dimensions.get('window');

export default function GetStarted() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/authentication/login');
  };

  const handleCreateAccount = () => {
    router.push('/authentication/signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={assets.logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.heading}>FamilyWallet</Text>
        <Text style={styles.subheading}>
          One wallet. Every bill.{'\n'}Every person in your life.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  imageContainer: {
    flex: 0.4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 40,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subheading: {
    fontSize: 18,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    width: width * 0.85,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    width: width * 0.85,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});