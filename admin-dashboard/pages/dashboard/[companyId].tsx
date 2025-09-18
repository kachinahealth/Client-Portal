import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';

interface Hospital {
  id: string;
  name: string;
  location: string;
  principalInvestigator: string;
  consentedPatients: number;
  randomizedPatients: number;
  consentRate: number;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  published: boolean;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { companyId } = router.query;
  
  const [activeTab, setActiveTab] = useState('enrollment');
  const [activeNewsTab, setActiveNewsTab] = useState('news');
  const [activeTrainingTab, setActiveTrainingTab] = useState('view');
  const [activeProtocolTab, setActiveProtocolTab] = useState('view');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newsForm, setNewsForm] = useState({ title: '', content: '' });
  const [pdfForm, setPdfForm] = useState({ title: '', description: '', category: '', file: null });
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', type: '', category: '' });
  const [protocolForm, setProtocolForm] = useState({ title: '', description: '', type: '', version: '1.0' });
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    principalInvestigator: '',
    consentedPatients: 0,
    randomizedPatients: 0,
    consentRate: 0
  });

  // Fetch data from backend
  useEffect(() => {
    if (companyId) {
      const fetchData = async () => {
        try {
          const [dashboardResponse, leaderboardResponse] = await Promise.all([
            fetch(`http://localhost:3000/api/company/${companyId}/dashboard`),
            fetch(`http://localhost:3000/api/company/${companyId}/leaderboard`)
          ]);

          if (leaderboardResponse.ok) {
            const data = await leaderboardResponse.json();
            setHospitals(data.hospitals || []);
          }

          if (dashboardResponse.ok) {
            const data = await dashboardResponse.json();
            setNews(data.news || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [companyId]);

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm)
      });

      if (response.ok) {
        const data = await response.json();
        setNews(prev => [...prev, data.news]);
        setNewsForm({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };

  const handleAddPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfForm.file) return;

    const formData = new FormData();
    formData.append('title', pdfForm.title);
    formData.append('description', pdfForm.description);
    formData.append('category', pdfForm.category);
    formData.append('pdfFile', pdfForm.file);

    try {
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/pdfs`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPdfs(prev => [...prev, data.pdf]);
        setPdfForm({ title: '', description: '', category: '', file: null });
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/training-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm)
      });

      if (response.ok) {
        setTrainingForm({ title: '', description: '', type: '', category: '' });
      }
    } catch (error) {
      console.error('Error adding training material:', error);
    }
  };

  const handleAddProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/study-protocols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolForm)
      });

      if (response.ok) {
        setProtocolForm({ title: '', description: '', type: '', version: '1.0' });
      }
    } catch (error) {
      console.error('Error adding protocol:', error);
    }
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital)
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(prev => [...prev, data.hospital]);
        setNewHospital({
          name: '',
          location: '',
          principalInvestigator: '',
          consentedPatients: 0,
          randomizedPatients: 0,
          consentRate: 0
        });
      }
    } catch (error) {
      console.error('Error adding hospital:', error);
    }
  };

  const getTotalStats = () => {
    return {
      consented: hospitals.reduce((sum, h) => sum + h.consentedPatients, 0),
      randomized: hospitals.reduce((sum, h) => sum + h.randomizedPatients, 0),
      sites: hospitals.length
    };
  };

  const stats = getTotalStats();

  const getRowColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return 'transparent';
    }
  };

  const getTrophyEmoji = (index: number) => {
    switch (index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>;
  }

  return (
    <>
      <Head>
        <title>{companyId} Dashboard - KachinaHealth</title>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', sans-serif;
          }
          .header {
            background: linear-gradient(135deg, #2196f3 0%, #26a69a 50%, #66bb6a 100%);
            padding: 1rem;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            background: #1e1e1e;
            padding: 1rem;
            border-radius: 10px;
          }
          .nav-tabs {
            display: flex;
            gap: 2rem;
            padding: 1rem;
            border-bottom: 1px solid #e0e0e0;
          }
          .nav-tab {
            padding: 0.5rem 1rem;
            cursor: pointer;
            color: #666;
            border: none;
            background: none;
            font-size: 1rem;
          }
          .nav-tab.active {
            color: #2196f3;
            border-bottom: 2px solid #2196f3;
          }
          .stat-card {
            background: #2196f3;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
          }
          .stat-number {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          .stat-label {
            font-size: 1.2rem;
            opacity: 0.9;
          }
          .form-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
          }
          .table-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .action-button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
          }
          .action-button:hover {
            background: #1976d2;
          }
        `}</style>
      </Head>

      <div className="header">
        <div className="logo">
          <img src="/logos/logo.png" alt="KachinaHealth" height="40" />
        </div>
        <Typography variant="h4">{companyId?.toString().toUpperCase()} Dashboard</Typography>
        <Button variant="outlined" color="inherit" onClick={() => router.push('/')}>
          Logout
        </Button>
      </div>

      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News & Updates
        </button>
        <button 
          className={`nav-tab ${activeTab === 'enrollment' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollment')}
        >
          Enrollment Leaderboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Training Materials
        </button>
        <button 
          className={`nav-tab ${activeTab === 'protocol' ? 'active' : ''}`}
          onClick={() => setActiveTab('protocol')}
        >
          Study Protocol
        </button>
      </div>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {activeTab === 'user' && (
          <div>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            {/* User management content will go here */}
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            <Typography variant="h6">News & Updates</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveNewsTab('news')}
                sx={{ bgcolor: activeNewsTab === 'news' ? 'primary.main' : 'grey.300' }}
              >
                News Items
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveNewsTab('pdf')}
                sx={{ bgcolor: activeNewsTab === 'pdf' ? 'primary.main' : 'grey.300' }}
              >
                PDF Documents
              </Button>
            </Box>

            {activeNewsTab === 'news' ? (
              <div className="form-container">
                <Typography variant="h6" gutterBottom>Add News Item</Typography>
                <form onSubmit={handleAddNews}>
                  <TextField
                    fullWidth
                    label="News Title"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter news title"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="News Content"
                    value={newsForm.content}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter news content"
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" type="submit">Add News</Button>
                </form>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Recent News</Typography>
                  {news.map((item) => (
                    <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{item.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button variant="contained" size="small" sx={{ mr: 1 }}>Edit</Button>
                        <Button variant="contained" color="error" size="small">Delete</Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </div>
            ) : (
              <div className="form-container">
                <Typography variant="h6" gutterBottom>Upload PDF Document</Typography>
                <form onSubmit={handleAddPdf}>
                  <TextField
                    fullWidth
                    label="Document Title"
                    value={pdfForm.title}
                    onChange={(e) => setPdfForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={pdfForm.description}
                    onChange={(e) => setPdfForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter document description"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Category"
                    value={pdfForm.category}
                    onChange={(e) => setPdfForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Training, Updates, Guidelines"
                    sx={{ mb: 2 }}
                  />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfForm(prev => ({ ...prev, file: e.target.files?.[0] }))}
                    style={{ marginBottom: '1rem', display: 'block' }}
                  />
                  <Button variant="contained" type="submit">Upload PDF</Button>
                </form>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>PDF Documents</Typography>
                  {pdfs.map((pdf) => (
                    <Paper key={pdf.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{pdf.title}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>{pdf.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" size="small">View PDF</Button>
                        <Button variant="outlined" size="small">Download</Button>
                        <Button variant="contained" color="error" size="small">Delete</Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div>
            <Typography variant="h6">Training Materials</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTrainingTab('view')}
                sx={{ bgcolor: activeTrainingTab === 'view' ? 'primary.main' : 'grey.300' }}
              >
                View Materials
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTrainingTab('upload')}
                sx={{ bgcolor: activeTrainingTab === 'upload' ? 'primary.main' : 'grey.300' }}
              >
                Upload New
              </Button>
            </Box>

            {activeTrainingTab === 'upload' && (
              <div className="form-container">
                <Typography variant="h6" gutterBottom>Add Training Material</Typography>
                <form onSubmit={handleAddTraining}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, title: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, description: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        fullWidth
                        label="Type"
                        value={trainingForm.type}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="">Select type</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="presentation">Presentation</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        select
                        fullWidth
                        label="Category"
                        value={trainingForm.category}
                        onChange={(e) => setTrainingForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="clinical">Clinical</option>
                      </TextField>
                    </Grid>
                  </Grid>
                  <Button variant="contained" type="submit">Add Training Material</Button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'protocol' && (
          <div>
            <Typography variant="h6">Study Protocol</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveProtocolTab('view')}
                sx={{ bgcolor: activeProtocolTab === 'view' ? 'primary.main' : 'grey.300' }}
              >
                View Protocols
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveProtocolTab('upload')}
                sx={{ bgcolor: activeProtocolTab === 'upload' ? 'primary.main' : 'grey.300' }}
              >
                Upload New
              </Button>
            </Box>

            {activeProtocolTab === 'upload' && (
              <div className="form-container">
                <Typography variant="h6" gutterBottom>Add Study Protocol</Typography>
                <form onSubmit={handleAddProtocol}>
                  <TextField
                    fullWidth
                    label="Protocol Title"
                    value={protocolForm.title}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, title: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={protocolForm.description}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, description: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        fullWidth
                        label="Type"
                        value={protocolForm.type}
                        onChange={(e) => setProtocolForm(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="">Select type</option>
                        <option value="main">Main Protocol</option>
                        <option value="amendment">Amendment</option>
                        <option value="appendix">Appendix</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Version"
                        value={protocolForm.version}
                        onChange={(e) => setProtocolForm(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="e.g., 1.0"
                      />
                    </Grid>
                  </Grid>
                  <Button variant="contained" type="submit">Add Study Protocol</Button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollment' && (
          <>
            <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              <div className="stat-card">
                <div className="stat-number">{stats.consented}</div>
                <div className="stat-label">Total Consented</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.randomized}</div>
                <div className="stat-label">Total Randomized</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.sites}</div>
                <div className="stat-label">Participating Sites</div>
              </div>
            </Box>

            <div className="form-container">
              <Typography variant="h6" gutterBottom>Add New Hospital</Typography>
              <form onSubmit={handleAddHospital}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hospital Name"
                      value={newHospital.name}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter hospital name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={newHospital.location}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State/Country"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Principal Investigator"
                      value={newHospital.principalInvestigator}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, principalInvestigator: e.target.value }))}
                      placeholder="Enter Principal Investigator's name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Consented Patients"
                      value={newHospital.consentedPatients}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, consentedPatients: parseInt(e.target.value) || 0 }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Randomized Patients"
                      value={newHospital.randomizedPatients}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, randomizedPatients: parseInt(e.target.value) || 0 }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Consent Rate (per month)"
                      value={newHospital.consentRate}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, consentRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" type="submit">Add Hospital</Button>
                </Box>
              </form>
            </div>

            <div className="table-container">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Hospital</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Principal Investigator</TableCell>
                      <TableCell align="right">Consented</TableCell>
                      <TableCell align="right">Randomized</TableCell>
                      <TableCell align="right">Rate/Month</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hospitals.map((hospital, index) => (
                      <TableRow key={hospital.id} sx={{ backgroundColor: getRowColor(index) }}>
                        <TableCell>{getTrophyEmoji(index) || index + 1}</TableCell>
                        <TableCell>{hospital.name}</TableCell>
                        <TableCell>{hospital.location}</TableCell>
                        <TableCell>{hospital.principalInvestigator}</TableCell>
                        <TableCell align="right" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                          {hospital.consentedPatients}
                        </TableCell>
                        <TableCell align="right">{hospital.randomizedPatients}</TableCell>
                        <TableCell align="right">{hospital.consentRate.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </>
        )}
      </Container>
    </>
  );
}