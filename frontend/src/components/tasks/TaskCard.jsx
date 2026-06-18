import React, { useState } from 'react';
import {
  Card, CardContent, CardActions, Typography, Chip, IconButton,
  Box, Tooltip, Menu, MenuItem
} from '@mui/material';
import { Edit, Delete, MoreVert, CalendarToday } from '@mui/icons-material';
import dayjs from 'dayjs';

const PRIORITY_COLORS = { LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error' };
const STATUS_COLORS = { TODO: 'default', IN_PROGRESS: 'primary', COMPLETED: 'success' };

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'COMPLETED';

  return (
    <Card variant="outlined" sx={{
      mb: 1.5, borderRadius: 2, transition: 'box-shadow 0.2s',
      borderLeft: `4px solid`,
      borderLeftColor: task.priority === 'URGENT' ? 'error.main'
        : task.priority === 'HIGH' ? 'warning.main'
        : task.priority === 'MEDIUM' ? 'info.main' : 'success.main',
      '&:hover': { boxShadow: 3 }
    }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{
            textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
            color: task.status === 'COMPLETED' ? 'text.disabled' : 'text.primary',
            flex: 1
          }}>
            {task.title}
          </Typography>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }} noWrap>
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip label={task.status.replace('_', ' ')} size="small" color={STATUS_COLORS[task.status]} />
          <Chip label={task.priority} size="small" color={PRIORITY_COLORS[task.priority]} variant="outlined" />
          {task.dueDate && (
            <Chip icon={<CalendarToday sx={{ fontSize: '12px !important' }} />}
              label={dayjs(task.dueDate).format('MMM D, YYYY')} size="small"
              color={isOverdue ? 'error' : 'default'} variant="outlined" />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(task)}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(task.id)}><Delete fontSize="small" /></IconButton></Tooltip>
      </CardActions>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
          <MenuItem key={s} selected={task.status === s} onClick={() => { onStatusChange(task.id, s); setAnchorEl(null); }}>
            {s.replace('_', ' ')}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default TaskCard;
