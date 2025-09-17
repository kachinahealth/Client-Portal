import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getLeaderboard(user?.companyId || 'cerevasc');
      
      // Sort hospitals by consented patients in descending order
      if (result.hospitals) {
        result.hospitals.sort((a: any, b: any) => b.consentedPatients - a.consentedPatients);
      }
      
      setData(result);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Enrollment Leaderboard</Text>
          <Text style={styles.subtitle}>Site Performance Rankings</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data?.summary?.totalConsented || 0}</Text>
            <Text style={styles.statLabel}>Total Consented</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data?.summary?.totalRandomized || 0}</Text>
            <Text style={styles.statLabel}>Total Randomized</Text>
          </View>
        </View>

        <View style={styles.leaderboardContainer}>
          {data?.hospitals?.map((hospital: any, index: number) => (
            <View key={hospital.id} style={[
              styles.hospitalCard,
              index === 0 && styles.firstPlace,
              index === 1 && styles.secondPlace,
              index === 2 && styles.thirdPlace
            ]}>
              <Text style={[
                styles.rankNumber,
                index < 3 && styles.topThreeRank
              ]}>{index + 1}</Text>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.piInfo}>{hospital.principalInvestigator}</Text>
                <Text style={styles.hospitalStats}>
                    {hospital.consentedPatients} Consented • {hospital.randomizedPatients} Randomized
                </Text>
              </View>
            </View>
          ))}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  leaderboardContainer: {
    padding: 20,
    gap: 15,
  },
  hospitalCard: {
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
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    width: 30,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  hospitalStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  firstPlace: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  secondPlace: {
    borderColor: '#C0C0C0',
    borderWidth: 2,
  },
  thirdPlace: {
    borderColor: '#CD7F32',
    borderWidth: 2,
  },
  topThreeRank: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  piInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
  }
});
