import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { MedicalServices, Business, Security, Analytics } from '@mui/icons-material';
import Head from 'next/head';

interface LoginForm {
  companyId: string;
  username: string;
  password: string;
}

export default function KachinaHealthLogin() {
  const [formData, setFormData] = useState<LoginForm>({
    companyId: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This would connect to your backend to authenticate the client
      const response = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect to client-specific dashboard
        window.location.href = `/dashboard/${formData.companyId}`;
      } else {
        setError('Invalid credentials. Please check your company ID, username, and password.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <Head>
        <title>KachinaHealth - Clinical Trial Management Platform</title>
        <meta name="description" content="Multi-tenant platform for medical device companies to manage clinical trials" />
      </Head>
      
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MedicalServices sx={{ fontSize: 40 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                KachinaHealth
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
              Clinical Trial Management Platform
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Login Form */}
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  Client Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Access your company's clinical trial dashboard
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Company ID"
                    value={formData.companyId}
                    onChange={handleInputChange('companyId')}
                    margin="normal"
                    required
                    placeholder="e.g., cerevasc"
                    helperText="Your unique company identifier"
                  />
                  
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    margin="normal"
                    required
                    placeholder="Enter your username"
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    margin="normal"
                    required
                    placeholder="Enter your password"
                  />

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Access Dashboard'}
                  </Button>
                </form>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                  Need access? Contact{' '}
                  <a href="mailto:support@kachinahealth.com" style={{ color: 'inherit' }}>
                    support@kachinahealth.com
                  </a>
                </Typography>
              </Paper>
            </Grid>

            {/* Features */}
            <Grid item xs={12} md={7}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" color="primary.main">
                Manage Your Clinical Trial Like Never Before
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
                KachinaHealth provides medical device companies with a comprehensive platform to manage 
                clinical trials, engage investigators, and track patient enrollment in real-time.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Business color="primary" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Multi-Tenant Platform
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Each company gets their own isolated environment with custom branding and data
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Security color="primary" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Secure & Compliant
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        HIPAA-compliant platform with enterprise-grade security and data isolation
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Analytics color="primary" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Real-Time Analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track enrollment metrics, investigator engagement, and trial progress
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <MedicalServices color="primary" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Mobile-First Design
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Custom mobile apps for investigators with real-time notifications
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
