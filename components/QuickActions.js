import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function QuickActions({ actions }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.actionBtn, action.disabled && styles.disabledBtn]}
            onPress={action.onPress}
            disabled={action.disabled}
          >
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.primary + '20' }]}>
              <Ionicons name={action.icon} size={28} color={Theme.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  actionLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
