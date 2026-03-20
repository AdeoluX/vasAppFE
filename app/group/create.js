import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GROUP_TYPES = ['Family', 'Household', 'Guardian', 'Small Business', 'Community', 'School Parent'];

export default function CreateGroup() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('Family');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        groupName: groupName.trim(),
        groupType: groupType.toLowerCase(),
      };

      const res = await api.createGroup(payload);
      const newGroupId = res.data?.data?._id || res.data?._id;

      // Update local state and storage
      const updatedUser = { ...user, groupId: newGroupId, accountType: 'group_head' };
      const newGroupObj = { _id: newGroupId, name: payload.groupName };
      
      if (!updatedUser.groups) {
        updatedUser.groups = [newGroupObj];
      } else {
        updatedUser.groups = [...updatedUser.groups, newGroupObj];
      }
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Group created successfully!', [
        { text: 'Continue', onPress: () => router.replace('/mainapp/home') }
      ]);
    } catch (error) {
       Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/mainapp/home')} 
          style={{ position: 'absolute', left: Theme.spacing.lg, top: 60 }}
        >
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Your Group</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          As a Group Head, you need to set up your group before managing members and shared wallets.
        </Text>

        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Doe Family"
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={styles.label}>Group Type</Text>
        <View style={styles.typeGrid}>
          {GROUP_TYPES.map(type => (
             <TouchableOpacity 
               key={type}
               style={[
                 styles.typeBtn, 
                 groupType === type && styles.typeBtnActive
               ]}
               onPress={() => setGroupType(type)}
             >
               <Text style={[
                 styles.typeBtnText,
                 groupType === type && styles.typeBtnTextActive
               ]}>{type}</Text>
             </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createBtn, loading && { opacity: 0.7 }]} 
          onPress={handleCreateGroup}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.createBtnText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  description: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  typeBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  typeBtnText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  createBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
