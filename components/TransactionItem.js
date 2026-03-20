import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionItem({ service, network, amount, date, status, type, onPress }) {
  // Determine icon based on service
  let iconName = 'receipt-outline';
  let iconColor = Theme.colors.primary;
  
  if (service?.toLowerCase().includes('data')) {
    iconName = 'wifi-outline';
    iconColor = '#10B981'; // green
  } else if (service?.toLowerCase().includes('airtime')) {
    iconName = 'call-outline';
    iconColor = '#3B82F6'; // blue
  } else if (service?.toLowerCase().includes('fund') || type?.toLowerCase() === 'credit') {
    iconName = 'add-circle-outline';
    iconColor = '#8B5CF6'; // purple
  }

  // Format date correctly
  let formattedDate = '';
  if (date) {
    const d = new Date(date);
    formattedDate = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const isCredit = type?.toLowerCase() === 'credit';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>{service} {network ? `- ${network}` : ''}</Text>
        <Text style={styles.date}>{formattedDate || 'Recent'}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          ₦{Math.abs(amount || 0).toLocaleString()}
        </Text>
        <Text style={[styles.status, status === 'failed' && styles.statusFailed]}>
          {status || 'Success'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debit: {
    color: '#EF4444', // red
  },
  credit: {
    color: '#8B5CF6', // purple
  },
  status: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  statusFailed: {
    color: Theme.colors.error,
  },
});
