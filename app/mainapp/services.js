import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import QuickActions from '../../components/QuickActions';

export default function Services() {
  const router = useRouter();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>
      <View style={styles.content}>
        <QuickActions actions={actions} />
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  content: {
    padding: Theme.spacing.lg,
  },
});
