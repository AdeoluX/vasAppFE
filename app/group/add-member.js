import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../constants/api';

export default function AddMember() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [spendLimit, setSpendLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async () => {
    if (!email || !phone || !spendLimit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { groupId: paramGroupId } = useLocalSearchParams();
    const groupId = paramGroupId || user?.groupId || user?.groups?.[0]?._id;
    
    if (!groupId) {
      Alert.alert('App Error', 'Missing group ID. Please go back to the dashboard and try again.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        groupId,
        email: email.trim(),
        phone: phone.trim(),
        spendLimit: Number(spendLimit),
      };

      await api.addGroupMember(payload);
      
      Alert.alert('Success', 'Member invited. They will receive an SMS with the app link.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
       Alert.alert('Error', error.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Member</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Member Email</Text>
        <TextInput
          style={styles.input}
          placeholder="member@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Member Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="080..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Monthly Spend Limit (₦)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5000"
          value={spendLimit}
          onChangeText={setSpendLimit}
          keyboardType="number-pad"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.addBtn, loading && { opacity: 0.7 }]} 
          onPress={handleAddMember}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.addBtnText}>Add Member</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
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
  content: {
    padding: Theme.spacing.lg,
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
  footer: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  addBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 18,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
