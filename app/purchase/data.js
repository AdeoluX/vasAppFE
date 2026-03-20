import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';

export default function BuyData() {
  const router = useRouter();
  const { userType, groupId } = useLocalSearchParams();
  const { user } = useAuth();

  const [networks, setNetworks] = useState([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [phone, setPhone] = useState(user?.phone || '');
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const res = await api.getNetworks('data');
      setNetworks(res.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load networks');
    } finally {
      setLoadingNetworks(false);
    }
  };

  const fetchPlans = async (networkId) => {
    setLoadingPlans(true);
    setPlans([]);
    setSelectedPlan(null);
    try {
      const res = await api.getDataPlans(networkId);
      setPlans(res.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleNetworkSelect = (net) => {
    setSelectedNetwork(net);
    if (net.identifier || net.id) {
      fetchPlans(net.identifier || net.id);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a data plan');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy ${selectedPlan.label} for ${phone}?`,
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
      const networkNameMatch = selectedNetwork.name.match(/([a-zA-Z0-9]+)/);
      const plainNetworkName = networkNameMatch ? networkNameMatch[0].toUpperCase() : 'MTN';

      const payload = {
        service: 'data',
        amount: Number(selectedPlan.amount),
        recipient: phone,
        network: plainNetworkName, 
        bundleId: selectedPlan.plan_code
      };

      if (userType === 'member' || userType === 'group_head') {
        if (groupId) payload.groupId = groupId;
      }

      await api.buyService(payload);
      
      Alert.alert('Success', `Data purchased successfully!`, [
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
        <Text style={styles.headerTitle}>Buy Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>1. Select Network</Text>
        {loadingNetworks ? (
          <ActivityIndicator size="small" color={Theme.colors.primary} style={{ alignSelf: 'flex-start' }} />
        ) : (
          <View style={styles.networkGrid}>
            {networks.map(net => (
              <TouchableOpacity
                key={net.identifier || net.id}
                style={[
                  styles.networkCard,
                  (selectedNetwork?.identifier === net.identifier || selectedNetwork?.id === net.id) && styles.networkCardSelected
                ]}
                onPress={() => handleNetworkSelect(net)}
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
                  (selectedNetwork?.identifier === net.identifier || selectedNetwork?.id === net.id) && styles.networkTextSelected
                ]}>{net.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedNetwork && (
          <>
            <Text style={styles.label}>2. Select Plan</Text>
            {loadingPlans ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <ScrollView style={styles.planList} nestedScrollEnabled>
                {plans.map((plan, index) => (
                  <TouchableOpacity
                    key={`${plan.plan_code || 'plan'}_${index}`}
                    style={[
                      styles.planCard,
                      selectedPlan === plan && styles.planCardSelected
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <Text style={[
                      styles.planLabel,
                      selectedPlan === plan && styles.planTextSelected
                    ]}>{plan.label}</Text>
                    <Text style={[
                      styles.planAmount,
                      selectedPlan === plan && styles.planTextSelected
                    ]}>₦{plan.amount?.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        <Text style={styles.label}>3. Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="080..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </ScrollView>

      {selectedPlan && (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryAmount}>₦{selectedPlan.amount?.toLocaleString()}</Text>
          </View>
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
      )}
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
    paddingBottom: 100, // accommodate footer
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
    paddingHorizontal: Theme.spacing.sm,
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
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  networkTextSelected: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  planList: {
    maxHeight: 250,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  planCardSelected: {
    backgroundColor: Theme.colors.primary + '10',
    borderRadius: Theme.borderRadius.sm,
    borderBottomWidth: 0,
  },
  planLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  planAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginLeft: 10,
  },
  planTextSelected: {
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
    marginBottom: Theme.spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
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
