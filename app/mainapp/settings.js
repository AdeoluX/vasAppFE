import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/authentication/get-started');
          }
        }
      ]
    );
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'group_head': return 'Group Head';
      case 'member': return 'Family Member';
      default: return 'Solo Account';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.firstName, user?.lastName)}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getAccountTypeLabel(user?.accountType)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={24} color={Theme.colors.textSecondary} />
            <Text style={styles.rowText}>Push Notifications</Text>
          </View>
          <Switch 
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
          />
        </View>

        <TouchableOpacity 
          style={styles.row}
          onPress={() => router.push('/authentication/forgot-password')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="lock-closed-outline" size={24} color={Theme.colors.textSecondary} />
            <Text style={styles.rowText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.border} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>FamilyWallet v1.0.0 (MVP)</Text>
    </ScrollView>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  badge: {
    backgroundColor: Theme.colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.md,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.error,
    marginLeft: Theme.spacing.sm,
  },
  version: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 40,
  },
});