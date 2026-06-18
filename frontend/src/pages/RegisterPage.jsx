import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress
} from '@mui/material';
import { TaskAlt } from '@mui/icons-material';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f4f8' }}>
      <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 440, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <TaskAlt sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight={700}>TaskFlow</Typography>
          <Typography variant="body2" color="text.secondary">Create your account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth name="fullName" label="Full Name" value={form.fullName}
            onChange={handleChange} sx={{ mb: 2 }} autoFocus />
          <TextField fullWidth name="username" label="Username" value={form.username}
            onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth name="email" label="Email" type="email" value={form.email}
            onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth name="password" label="Password" type="password" value={form.password}
            onChange={handleChange} required sx={{ mb: 3 }} inputProps={{ minLength: 6 }} />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{ mb: 2, py: 1.5, fontWeight: 600 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2', fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
