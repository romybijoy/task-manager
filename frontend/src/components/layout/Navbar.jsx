import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Box, Tooltip
} from '@mui/material';
import { TaskAlt, Logout, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase();

  return (
    <AppBar position="fixed" elevation={1} sx={{ zIndex: 1300 }}>
      <Toolbar>
        <TaskAlt sx={{ mr: 1.5 }} />
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>TaskFlow</Typography>

        <Tooltip title={user?.username}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 14 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem disabled>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>{user?.fullName || user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} /> Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
