import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../constants/api';
import WebView from 'react-native-webview';

export default function FundWallet() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  const handleFund = async () => {
    if (!amount || Number(amount) < 500) {
      Alert.alert('Error', 'Minimum funding amount is ₦500');
      return;
    }

    setLoading(true);
    try {
      const payload = { amount: Number(amount) };
      if (groupId) {
        payload.groupId = groupId;
      }
      const res = await api.initializeFunding(payload);
      const authUrl = res.data?.data?.authorization_url || res.data?.authorization_url;

      if (authUrl) {
        setCheckoutUrl(authUrl);
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to initialize payment.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavStateChange = (newNavState) => {
    // You could check newNavState.url here to see if it redirects 
    // to your callback URL and automatically close the webview if successful.
  };

  const INJECTED_JAVASCRIPT = `
    (function() {
      var checkSuccess = function() {
        if (document.body && document.body.innerText.includes('Payment Successful')) {
          window.ReactNativeWebView.postMessage('SUCCESS');
        } else {
          setTimeout(checkSuccess, 1000);
        }
      };
      checkSuccess();
    })();
    true; // note: this is required, or you'll sometimes get silent failures
  `;

  // If a checkout URL is available, render the WebView instead of the form
  if (checkoutUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.surface }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={Theme.colors.text} />
            <Text style={styles.closeBtnText}>Close & Return</Text>
          </TouchableOpacity>
        </View>
        <WebView 
          source={{ uri: checkoutUrl }} 
          style={{ flex: 1 }}
          onNavigationStateChange={handleWebViewNavStateChange}
          startInLoadingState={true}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={(event) => {
            if (event.nativeEvent.data === 'SUCCESS') {
              // Automatically navigate back home after 3 seconds of showing the success receipt
              setTimeout(() => {
                router.replace('/mainapp/home');
              }, 3000);
            }
          }}
          renderLoading={() => (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fund Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Amount to Fund (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="Min ₦500"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            autoFocus
          />
          <Text style={styles.feeWarning}>Note: A 1.5% + ₦100 Paystack processing fee may apply.</Text>
        </View>

        <TouchableOpacity 
          style={[styles.fundBtn, loading && { opacity: 0.7 }]} 
          onPress={handleFund}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.fundBtnText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  feeWarning: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  fundBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  fundBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.sm,
    fontWeight: '500',
  },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  }
});
