import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api'; // Assuming a profile endpoint provides members

export default function People() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    if (user?.accountType !== 'group_head') return;
    
    setRefreshing(true);
    try {
      // Per PDF: "The profile endpoint (GET /api/v1/auth/profile) may return member data for a group head."
      const res = await api.getProfile();
      // Safely access the deeply nested members array based on conventional payload shapes.
      // E.g. res.data.group.members OR res.data.members
      const fetchedMembers = res.data?.group?.members || res.data?.members || [];
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Failed to fetch members', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : 'M'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name || item.email}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
      </View>
      <View style={styles.memberStats}>
        <Text style={styles.limitText}>₦{item.spentThisMonth || 0} / ₦{item.spendLimit || 0}</Text>
        <View style={[styles.badge, item.status === 'frozen' ? styles.badgeFrozen : styles.badgeActive]}>
          <Text style={styles.badgeText}>{item.status === 'frozen' ? 'Frozen' : 'Active'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (user?.accountType !== 'group_head') {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={Theme.colors.border} />
        <Text style={styles.emptyText}>This tab is for Group Heads.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Members</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item, index) => item._id || String(index)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMembers} />}
        renderItem={renderMember}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
             <Ionicons name="people-outline" size={64} color={Theme.colors.border} />
             <Text style={styles.emptyText}>No members yet.</Text>
             <Text style={styles.emptySubText}>Add your first family member to start sharing your wallet.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/group/add-member')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: 100, // For FAB
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  memberPhone: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  limitText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#DEF7EC',
  },
  badgeFrozen: {
    backgroundColor: '#FDE8E8',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  emptySubText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});