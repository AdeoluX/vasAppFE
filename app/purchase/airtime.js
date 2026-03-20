import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';

export default function BuyAirtime() {
  const router = useRouter();
  const { userType, groupId } = useLocalSearchParams();
  const { user } = useAuth();

  const [networks, setNetworks] = useState([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const res = await api.getNetworks('airtime');
      setNetworks(res.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load networks');
    } finally {
      setLoadingNetworks(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNetwork) {
      Alert.alert('Error', 'Please select a network');
      return;
    }
    if (!amount || Number(amount) < 50) {
      Alert.alert('Error', 'Minimum amount is ₦50');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy ₦${amount} Airtime for ${phone} on ${selectedNetwork.name.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: executePurchase
        }
      ]
    );
  };

  const executePurchase = async () => {
    setLoadingPurchase(true);
    try {
      const payload = {
        service: 'airtime',
        amount: Number(amount),
        recipient: phone,
        // Map network id for purchase (MTN, AIRTEL, GLO, 9mobile) based on API spec
        network: selectedNetwork.name.toUpperCase().replace(/[^A-Z0-9]/g, ''), 
      };

      if (userType === 'member' || userType === 'group_head') {
        if (groupId) payload.groupId = groupId;
      }

      await api.buyService(payload);
      
      Alert.alert('Success', `Airtime purchased successfully!`, [
        { text: 'Back to Home', onPress: () => router.back() }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Transaction failed';
      if (msg.toLowerCase().includes('balance')) {
        Alert.alert('Insufficient Balance', 'You do not have enough funds.', [
          { text: 'Cancel' },
          { text: 'Fund Wallet', onPress: () => router.push('/wallet/fund') }
        ]);
      } else if (msg.toLowerCase().includes('limit')) {
         Alert.alert('Limit Reached', 'You have reached your monthly limit. Contact your group head.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoadingPurchase(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Airtime</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Select Network</Text>
        {loadingNetworks ? (
          <ActivityIndicator size="small" color={Theme.colors.primary} style={{ alignSelf: 'flex-start' }} />
        ) : (
          <View style={styles.networkGrid}>
            {networks.map(net => (
              <TouchableOpacity
                key={net.id}
                style={[
                  styles.networkCard,
                  selectedNetwork?.id === net.id && styles.networkCardSelected
                ]}
                onPress={() => setSelectedNetwork(net)}
              >
                {net.image && (
                  <Image 
                    source={{ uri: net.image }} 
                    style={styles.networkLogo} 
                    resizeMode="contain" 
                  />
                )}
                <Text style={[
                  styles.networkText,
                  selectedNetwork?.id === net.id && styles.networkTextSelected
                ]}>{net.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Amount (₦)</Text>
        <TextInput
          style={styles.input}
          placeholder="Min ₦50"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="080..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.buyBtn, loadingPurchase && { opacity: 0.7 }]} 
          onPress={handlePurchase}
          disabled={loadingPurchase}
        >
          {loadingPurchase ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buyBtnText}>Buy Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  networkCard: {
    width: '48%',
    paddingVertical: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  networkCardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + '10',
  },
  networkLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  networkText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
  },
  networkTextSelected: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 56,
    fontSize: 16,
    color: Theme.colors.text,
  },
  footer: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  buyBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
