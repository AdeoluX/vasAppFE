import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function WalletCard({ title, balance, loading, subtitle, onFund }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name="wallet-outline" size={24} color={Theme.colors.primary} />
      </View>
      
      <View style={styles.balanceRow}>
        <View style={styles.balanceContainer}>
          <Text style={styles.currency}>₦</Text>
          {loading ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.loader} />
          ) : (
            <Text style={styles.balance}>
              {balance != null ? balance.toLocaleString() : '0.00'}
            </Text>
          )}
        </View>

        {onFund && (
          <TouchableOpacity style={styles.fundBtn} onPress={onFund}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.fundBtnText}>Fund</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: 4,
    marginRight: 4,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -1,
  },
  loader: {
    marginTop: 10,
    marginLeft: 10,
  },
  fundBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  fundBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
  },
});
