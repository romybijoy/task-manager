import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, CircularProgress, Grid
} from '@mui/material';
import { taskApi } from '../../api/taskApi';

const defaultForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
};

/**
 * Props:
 *   open       {boolean}   - controls dialog visibility
 *   onClose    {function}  - called when dialog should close
 *   onSaved    {function}  - called after successful create/update so parent can refresh
 *   task       {object}    - if provided, dialog is in edit mode; null/undefined = create mode
 */
export default function TaskFormDialog({ open, onClose, onSaved, task }) {
  const isEdit = Boolean(task);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing, reset when creating
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'TODO',
        priority:    task.priority    || 'MEDIUM',
        dueDate:     task.dueDate     || '',
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [task, open]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description,
        status:      form.status,
        priority:    form.priority,
        dueDate:     form.dueDate || null,
      };

      if (isEdit) {
        await taskApi.update(task.id, payload);
      } else {
        await taskApi.create(payload);
      }

      // Tell the parent to refresh its task list, then close
      if (typeof onSaved === 'function') onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        )}

        <TextField
          fullWidth
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          margin="normal"
          autoFocus
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={form.status} onChange={handleChange} label="Status">
                <MenuItem value="TODO">To Do</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                {/* <MenuItem value="CANCELLED">Cancelled</MenuItem> */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={form.priority} onChange={handleChange} label="Priority">
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Due Date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' },
          }}
        >
          {loading
            ? <CircularProgress size={20} color="inherit" />
            : isEdit ? 'Save Changes' : 'Create Task'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}