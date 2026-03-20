import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Theme } from '../../constants/theme';
import TransactionItem from '../../components/TransactionItem';
import * as api from '../../constants/api';

// Mock data since endpoint isn't defined in API yet
const MOCK_TRANSACTIONS = [
  { id: '1', service: 'airtime', network: 'MTN', amount: 500, date: new Date().toISOString(), status: 'success', recipient: '08012345678' },
  { id: '2', service: 'data', network: 'GLO', amount: 1200, date: new Date(Date.now() - 86400000).toISOString(), status: 'success', recipient: '08087654321' },
  { id: '3', service: 'fund', amount: 5000, date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'success' },
  { id: '4', service: 'airtime', network: 'AIRTEL', amount: 200, date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'failed', recipient: '08022223333' },
];

export default function Activity() {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All | Airtime | Data

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setRefreshing(true);
    try {
      const params = {};
      if (filter !== 'All') {
        // Assume API expects 'type' like 'data', 'airtime', 'fund'
        params.type = filter.toLowerCase();
      }
      
      const res = await api.getTransactions(params);
      
      // Handle various common payload structures
      let rawData = [];
      if (res.data && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res.data?.transactions && Array.isArray(res.data.transactions)) {
        rawData = res.data.transactions;
      }

      // Map to TransactionItem props if needed, assuming API aligns with service/network/amount/status/createdAt
      const formattedData = rawData.map(tx => ({
        id: tx._id || tx.id,
        service: tx.description || tx.narration || tx.title || tx.service || tx.type || 'transaction',
        network: tx.network || '',
        amount: tx.amount || 0,
        type: tx.type || 'debit', // credit or debit
        date: tx.createdAt || tx.date || new Date().toISOString(),
        status: tx.status || 'success',
        recipient: tx.recipient || tx.beneficiary || ''
      }));

      setTransactions(formattedData);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderFilterBtn = (title) => (
    <TouchableOpacity 
      style={[styles.filterBtn, filter === title && styles.filterBtnActive]}
      onPress={() => setFilter(title)}
    >
      <Text style={[styles.filterText, filter === title && styles.filterTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      <View style={styles.filterBar}>
        {renderFilterBtn('All')}
        {renderFilterBtn('Airtime')}
        {renderFilterBtn('Data')}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />}
        renderItem={({ item }) => (
          <TransactionItem {...item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
            <Text style={styles.emptySubText}>Start by buying data or airtime.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
});
