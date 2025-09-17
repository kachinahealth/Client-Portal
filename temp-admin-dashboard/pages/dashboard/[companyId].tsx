import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  People,
  Assessment,
  Notifications,
  Upload,
  CheckCircle,
  Cancel,
  Add,
  Edit,
  Delete,
  TrendingUp,
  PersonAdd,
  News
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  site: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
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
  
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newsDialog, setNewsDialog] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (companyId) {
      // Simulate loading data
      setTimeout(() => {
        setUsers([
          {
            id: '1',
            email: 'dr.smith@hospital.com',
            firstName: 'John',
            lastName: 'Smith',
            site: 'Memorial Hospital',
            role: 'investigator',
            status: 'pending',
            registrationDate: '2024-01-15'
          },
          {
            id: '2',
            email: 'dr.jones@clinic.com',
            firstName: 'Sarah',
            lastName: 'Jones',
            site: 'City Clinic',
            role: 'investigator',
            status: 'approved',
            registrationDate: '2024-01-10'
          }
        ]);
        
        setNews([
          {
            id: '1',
            title: 'New Protocol Update',
            content: 'Important updates to the trial protocol have been released.',
            date: '2024-01-20',
            published: true
          }
        ]);
        
        setLoading(false);
      }, 1000);
    }
  }, [companyId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserApproval = (user: User, approved: boolean) => {
    setSelectedUser(user);
    setApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (selectedUser) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: approvalDialog ? 'approved' : 'rejected' }
          : user
      ));
      setApprovalDialog(false);
      setSelectedUser(null);
    }
  };

  const handleAddNews = () => {
    setNewsForm({ title: '', content: '' });
    setNewsDialog(true);
  };

  const saveNews = () => {
    if (newsForm.title && newsForm.content) {
      const newNews: NewsItem = {
        id: Date.now().toString(),
        title: newsForm.title,
        content: newsForm.content,
        date: new Date().toISOString().split('T')[0],
        published: false
      };
      setNews(prev => [...prev, newNews]);
      setNewsDialog(false);
      setNewsForm({ title: '', content: '' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{companyId} Dashboard - KachinaHealth</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {companyId?.toString().toUpperCase()} Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Clinical Trial Management
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => router.push('/')}
              >
                Logout
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Users
                      </Typography>
                      <Typography variant="h4" component="div">
                        {users.length}
                      </Typography>
                    </Box>
                    <People color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Approvals
                      </Typography>
                      <Typography variant="h4" component="div">
                        {users.filter(u => u.status === 'pending').length}
                      </Typography>
                    </Box>
                    <PersonAdd color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Active Users
                      </Typography>
                      <Typography variant="h4" component="div">
                        {users.filter(u => u.status === 'approved').length}
                      </Typography>
                    </Box>
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        News Items
                      </Typography>
                      <Typography variant="h4" component="div">
                        {news.length}
                      </Typography>
                    </Box>
                    <News color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="User Management" />
                <Tab label="News & Updates" />
                <Tab label="Analytics" />
                <Tab label="Settings" />
              </Tabs>
            </Box>

            {/* User Management Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Investigator Registrations</Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Export Data
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Site</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.site}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            color={user.status === 'approved' ? 'success' : user.status === 'rejected' ? 'error' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{user.registrationDate}</TableCell>
                        <TableCell>
                          {user.status === 'pending' && (
                            <Box>
                              <IconButton 
                                color="success" 
                                onClick={() => handleUserApproval(user, true)}
                                size="small"
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleUserApproval(user, false)}
                                size="small"
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* News & Updates Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">News & Updates</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddNews}>
                  Add News
                </Button>
              </Box>

              <Grid container spacing={3}>
                {news.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6">{item.title}</Typography>
                          <Chip 
                            label={item.published ? 'Published' : 'Draft'} 
                            color={item.published ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.date}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Enrollment Analytics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Enrollment Trends</Typography>
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Chart placeholder</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Site Performance</Typography>
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Chart placeholder</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Company Settings</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Branding</Typography>
                      <TextField
                        fullWidth
                        label="Company Name"
                        defaultValue={companyId?.toString().toUpperCase()}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Primary Color"
                        margin="normal"
                        type="color"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Configure email and push notification settings
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Container>
      </Box>

      {/* User Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>Confirm User Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedUser?.status === 'pending' ? 'approve' : 'reject'} 
            {selectedUser?.firstName} {selectedUser?.lastName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button onClick={confirmApproval} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add News Dialog */}
      <Dialog open={newsDialog} onClose={() => setNewsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add News Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newsForm.title}
            onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Content"
            value={newsForm.content}
            onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsDialog(false)}>Cancel</Button>
          <Button onClick={saveNews} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
