import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, Paper, Alert,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, TaskAlt } from '@mui/icons-material';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f4f8' }}>
      <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <TaskAlt sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight={700}>TaskFlow</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth name="username" label="Username" value={form.username}
            onChange={handleChange} required sx={{ mb: 2 }} autoFocus
          />
          <TextField
            fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={handleChange} required sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{ mb: 2, py: 1.5, fontWeight: 600 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', fontWeight: 600 }}>Create one</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
