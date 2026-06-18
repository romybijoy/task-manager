import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { TaskAlt } from '@mui/icons-material';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name Validation
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    }

    // Username Validation
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username =
        'Username can contain only letters, numbers and underscore';
    }

    // Email Validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password Validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password =
        'Password must be at least 6 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.password)
    ) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(form);

      setSuccess('Account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f0f4f8'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 440,
          borderRadius: 3
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}
        >
          <TaskAlt
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 1
            }}
          />

          <Typography variant="h4" fontWeight={700}>
            TaskFlow
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Create your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="fullName"
            label="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            error={!!errors.fullName}
            helperText={errors.fullName}
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
            error={!!errors.username}
            helperText={errors.username}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mb: 2,
              py: 1.5,
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#1976d2',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;