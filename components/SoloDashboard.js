import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import * as api from '../constants/api';
import WalletCard from './WalletCard';
import QuickActions from './QuickActions';
import TransactionItem from './TransactionItem';
import { Ionicons } from '@expo/vector-icons';

export default function SoloDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]); // Mock for MVP until endpoint confirmed
  const [userGroups, setUserGroups] = useState([]);

  const fetchDashboardData = async () => {
    try {
      if (user?.accountType !== 'solo') {
         try {
           const groupRes = await api.getGroup();
           if (groupRes?.data) {
              setUserGroups([{ _id: groupRes.data._id, name: groupRes.data.groupName || 'My Family' }]);
           }
         } catch (e) {
           setUserGroups(user?.groups || []);
         }
      } else {
         setUserGroups(user?.groups || []);
      }

      const balanceRes = await api.getWalletBalance();
      // Assuming response shape has data.balance
      setBalance(balanceRes.data?.balance || 0);

      const txRes = await api.getTransactions({ limit: 5 });
      let rawData = [];
      if (txRes.data && Array.isArray(txRes.data)) rawData = txRes.data;
      else if (txRes.data?.data && Array.isArray(txRes.data.data)) rawData = txRes.data.data;
      else if (txRes.data?.transactions && Array.isArray(txRes.data.transactions)) rawData = txRes.data.transactions;
      
      const formattedData = rawData.map(tx => ({
        id: tx._id || tx.id,
        service: tx.description || tx.narration || tx.title || tx.service || tx.type || 'transaction',
        network: tx.network || '',
        amount: tx.amount || 0,
        type: tx.type || 'debit',
        date: tx.createdAt || tx.date || new Date().toISOString(),
        status: tx.status || 'success',
        recipient: tx.recipient || tx.beneficiary || ''
      }));
      setTransactions(formattedData);

    } catch (error) {
      console.error('Failed to fetch solo dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const actions = [
    {
      label: 'Buy Data',
      icon: 'wifi-outline',
      onPress: () => router.push({ pathname: '/purchase/data', params: { userType: 'solo' } })
    },
    {
      label: 'Buy Airtime',
      icon: 'call-outline',
      onPress: () => router.push({ pathname: '/purchase/airtime', params: { userType: 'solo' } })
    },
    {
      label: 'Fund Wallet',
      icon: 'add-circle-outline',
      onPress: () => router.push('/wallet/fund')
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}</Text>
          <Text style={styles.subGreeting}>Welcome back</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color={Theme.colors.text} />
      </View>

      {balance !== null && balance < 2000 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Low wallet balance. Top up to continue buying.</Text>
        </View>
      )}

      <WalletCard 
        title="Personal Wallet" 
        balance={balance} 
        loading={loading} 
        subtitle="Current Balance"
        onFund={() => router.push('/wallet/fund')}
      />

      <QuickActions actions={actions} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Groups & Families</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
          {userGroups.map((group, idx) => (
            <TouchableOpacity 
              key={group._id || idx} 
              style={styles.groupCard}
              onPress={() => router.push({ pathname: `/group/${group._id || 'unknown'}`, params: { name: group.name } })}
            >
              <View style={styles.groupIconContainer}>
                 <Ionicons name="people" size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.groupCardName} numberOfLines={1}>{group.name || 'Group'}</Text>
              <Text style={styles.groupCardRole}>Manage</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[styles.groupCard, styles.createGroupCard]}
            onPress={() => router.push('/group/create')}
          >
            <View style={[styles.groupIconContainer, { backgroundColor: Theme.colors.background }]}>
               <Ionicons name="add" size={28} color={Theme.colors.textSecondary} />
            </View>
            <Text style={styles.createGroupText}>Create Family</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyStateText}>No transactions yet.</Text>
            <Text style={styles.emptyStateSub}>Start by buying data or airtime.</Text>
          </View>
        ) : (
          transactions.map((tx, idx) => (
            <TransactionItem key={idx} {...tx} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  banner: {
    backgroundColor: '#FEF3C7',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
  },
  bannerText: {
    color: '#92400E',
    fontWeight: '500',
    fontSize: 14,
  },
  section: {
    marginTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyStateText: {
    marginTop: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  emptyStateSub: {
    marginTop: 4,
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  seeAllText: {
    color: Theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  carousel: {
    marginHorizontal: -Theme.spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    gap: 12,
  },
  groupCard: {
    width: 140,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupCard: {
    borderStyle: 'dashed',
    backgroundColor: Theme.colors.background,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  groupCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  groupCardRole: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  createGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
    textAlign: 'center',
  },
});
