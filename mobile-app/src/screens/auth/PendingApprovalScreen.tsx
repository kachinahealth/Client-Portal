import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function PendingApprovalScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const { user, checkApprovalStatus, logout } = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkApprovalStatus();
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    // Check approval status when component mounts
    onRefresh();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Ionicons name="time-outline" size={40} color="#FF9500" />
            </View>
            <Text style={styles.statusTitle}>Pending Approval</Text>
            <Text style={styles.statusSubtitle}>
              Your account is under review by CereVasc
            </Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          {user?.site?.siteName && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user.site.siteName}</Text>
            </View>
          )}
        </View>

        {/* Approval Process */}
        <View style={styles.processContainer}>
          <Text style={styles.processTitle}>Approval Process</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Registration Submitted</Text>
              <Text style={styles.stepDescription}>
                Your registration has been successfully submitted
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="time-circle" size={24} color="#FF9500" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Under Review</Text>
              <Text style={styles.stepDescription}>
                CereVasc is reviewing your credentials and site information
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons name="mail-circle-outline" size={24} color="#999" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Notification</Text>
              <Text style={styles.stepDescription}>
                You will receive an email notification once approved
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            If you have questions about your registration or approval status, please contact:
          </Text>
          
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
            <Text style={styles.contactEmail}>support@cerevasc.com</Text>
          </View>
          
          <View style={styles.contactInfo}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
            <Text style={styles.contactPhone}>+1 (555) 123-4567</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh-outline" size={20} color="#007AFF" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Checking...' : 'Check Status'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            STRIDE Trial - NCT06498960
          </Text>
          <Text style={styles.footerText}>
            © 2024 CereVasc Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  processContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  contactPhone: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  actionContainer: {
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});
