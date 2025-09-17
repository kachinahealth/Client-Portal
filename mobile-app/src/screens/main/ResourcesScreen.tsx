import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Resources</Text>
          <Text style={styles.subtitle}>Training Materials & Protocols</Text>
        </View>

        <View style={styles.sectionsContainer}>
          {/* Training Materials Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Materials</Text>
            
            <TouchableOpacity style={styles.resourceCard}>
              <View style={styles.resourceIcon}>
                <Ionicons name="play-circle-outline" size={24} color="#1976d2" />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Device Training Video</Text>
                <Text style={styles.resourceMeta}>Video • 15 minutes</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCard}>
              <View style={styles.resourceIcon}>
                <Ionicons name="document-text-outline" size={24} color="#1976d2" />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Enrollment Guide</Text>
                <Text style={styles.resourceMeta}>PDF • 12 pages</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Study Protocols Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Protocols</Text>
            
            <TouchableOpacity style={styles.resourceCard}>
              <View style={styles.resourceIcon}>
                <Ionicons name="journal-outline" size={24} color="#1976d2" />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Current Protocol v2.1</Text>
                <Text style={styles.resourceMeta}>PDF • Updated March 2024</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCard}>
              <View style={styles.resourceIcon}>
                <Ionicons name="list-outline" size={24} color="#1976d2" />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Protocol Amendment Summary</Text>
                <Text style={styles.resourceMeta}>PDF • 4 pages</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionsContainer: {
    padding: 20,
    gap: 25,
  },
  section: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  resourceCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  resourceMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
