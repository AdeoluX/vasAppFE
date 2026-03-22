import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';
import WalletCard from '../../components/WalletCard';
import QuickActions from '../../components/QuickActions';
import TransactionItem from '../../components/TransactionItem';
import { Ionicons } from '@expo/vector-icons';

export default function GroupDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, name } = useLocalSearchParams(); // Passed from the Carousel
  
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      if (id) {
        const balanceRes = await api.getWalletBalance(id);
        setBalance(balanceRes.data?.balance || 0);
      }
      
      const txRes = await api.getTransactions({ limit: 5, groupId: id });
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

      // Fetch Group Members
      const membersRes = await api.getGroupMembers(id);
      let fetchedMembers = [];
      if (Array.isArray(membersRes.data)) fetchedMembers = membersRes.data;
      else if (membersRes.data?.members) fetchedMembers = membersRes.data.members;
      else if (membersRes.members) fetchedMembers = membersRes.members;
      
      setMembers(fetchedMembers);

    } catch (error) {
      console.error('Failed to fetch group dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const isHead = user.accountType === 'group_head'; // Need more robust check if multiple groups

  const actions = isHead ? [
    {
      label: 'Buy For...',
      icon: 'gift-outline',
      onPress: () => router.push({ pathname: '/purchase/data', params: { userType: 'group_head' } })
    },
    {
      label: 'Add Member',
      icon: 'person-add-outline',
      onPress: () => router.push({ pathname: '/group/add-member', params: { groupId: id } })
    }
  ] : [
    {
      label: 'Buy Data',
      icon: 'wifi-outline',
      onPress: () => router.push({ pathname: '/purchase/data', params: { userType: 'member' } })
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Group Dashboard'}</Text>
        <Ionicons name="settings-outline" size={24} color={Theme.colors.text} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {balance !== null && balance < 2000 && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Low group wallet balance. Top up to continue buying.</Text>
          </View>
        )}

        <WalletCard 
          title="Group Wallet"
          balance={balance} 
          loading={loading} 
          subtitle="Shared Family Balance"
          onFund={() => router.push({ pathname: '/wallet/fund', params: { groupId: id } })}
        />

        <QuickActions actions={actions} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Theme.colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyStateText}>Your family group is empty.</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => router.push({ pathname: '/group/add-member', params: { groupId: id } })}>
                <Text style={styles.addBtnText}>Add your first member</Text>
              </TouchableOpacity>
            </View>
          ) : (
            members.map((member, idx) => (
              <View key={idx} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>
                    {(member.name || member.email || 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name || member.email || member.phone}</Text>
                  <Text style={styles.memberStatus}>{member.status || 'Active'}</Text>
                </View>
                <Text style={styles.memberLimit}>₦{member.spendLimit || 0}</Text>
              </View>
            ))
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
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
  backBtn: {
    padding: 4,
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
    paddingBottom: Theme.spacing.xl,
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
  addBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  memberStatus: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  memberLimit: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
  }
});
