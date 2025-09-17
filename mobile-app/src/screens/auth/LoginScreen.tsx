import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
    }

    setIsLoading(true);
    try {
        // First test the simpler endpoint
        console.log('Testing mobile endpoint...');
        const testResponse = await fetch('http://192.168.0.23:3000/api/auth/mobile/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email.trim() })
        });

        const testData = await testResponse.text();
        console.log('Test endpoint response:', testData);

        // If test works, try the real endpoint
        console.log('Sending request to:', `http://192.168.0.23:3000/api/auth/mobile/request-code`);
        const response = await fetch('http://192.168.0.23:3000/api/auth/mobile/request-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email.trim() })
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response was:', responseText);
            throw new Error('Invalid server response');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send code');
        }

        setIsCodeRequested(true);
        Alert.alert('Success', 'Check your email for the login code');
        console.log('Email preview:', data.emailPreview);

    } catch (error: any) {
        console.error('Login Error:', error);
        Alert.alert('Error', error.message || 'Failed to send code');
    } finally {
        setIsLoading(false);
    }
};

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the code from your email');
      return;
    }

    setIsLoading(true);
    try {
        console.log('Verifying code for email:', email);
        const response = await fetch('http://192.168.0.23:3000/api/auth/mobile/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                email: email.trim(),
                code: code.trim()
            })
        });

        const responseText = await response.text();
        console.log('Verification response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Invalid server response');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Verification failed');
        }

        // Handle successful verification
        await signIn(data.user);
        Alert.alert('Success', 'Login successful!');

    } catch (error: any) {
        console.error('Verification Error:', error);
        Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={60} color="#007AFF" />
            </View>
            <Text style={styles.title}>STRIDE Trial</Text>
            <Text style={styles.subtitle}>Investigator Portal</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isCodeRequested}
              />
            </View>

            {isCodeRequested && (
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={isCodeRequested ? handleVerifyCode : handleRequestCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isCodeRequested ? 'Verify Code' : 'Send Login Code'}
                </Text>
              )}
            </TouchableOpacity>

            {isCodeRequested && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setIsCodeRequested(false);
                  setCode('');
                }}
              >
                <Text style={styles.resendText}>Try different email</Text>
              </TouchableOpacity>
            )}

            {/* Add Register Link before the footer */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                <Text style={styles.registerLink}>Create New User</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 CereVasc Inc. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              STRIDE Trial - NCT06498960
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a1a1a',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    color: '#007AFF',
    fontWeight: '600',
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
