import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Menu,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Search,
  CheckCircle,
  RadioButtonUnchecked,
  HourglassEmpty,
  Logout,
  Delete,
  Edit,
  Assignment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { taskApi } from "../api/taskApi";
import TaskForm from "../components/tasks/TaskFormDialog";
import TaskCard from "../components/tasks/TaskCard";

const STAT_CARDS = [
  { key: "total", label: "Total Tasks", icon: Assignment, color: "#667eea" },
  { key: "todo", label: "To Do", icon: RadioButtonUnchecked, color: "#f59e0b" },
  {
    key: "inProgress",
    label: "In Progress",
    icon: HourglassEmpty,
    color: "#3b82f6",
  },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "#10b981" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    // cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Debounce search so it waits 400 ms after the user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteDialogId, setDeleteDialogId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // fetchData depends on debounced search + filter dropdowns (all sent together)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const [tasksRes, statsRes] = await Promise.all([
        taskApi.getAll(params),
        taskApi.getStats(),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDelete = async (id) => {
    try {
      await taskApi.delete(id);
      setDeleteDialogId(null);
      fetchData();
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleTaskSaved = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
    fetchData();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    const current = tasks.find((t) => t.id === id);
    // Send the full task with only status swapped, so a validated backend
    // body can't reject it for "missing" fields.
    const payload = current
      ? {
          title: current.title,
          description: current.description,
          status,
          priority: current.priority,
          dueDate: current.dueDate,
        }
      : { status };
    try {
      await taskApi.update(id, payload);
      fetchData();
    } catch (err) {
      console.error(
        "Status update failed:",
        err.response?.status,
        err.response?.data,
      );
      setError("Failed to update task status.");
    }
  };

  const displayName = user?.fullName || user?.username || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Top Navigation */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(102,126,234,0.4)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CheckCircle sx={{ color: "white", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="white">
            TaskFlow
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            color="rgba(255,255,255,0.85)"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Welcome, {displayName}
          </Typography>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              cursor: "pointer",
              width: 36,
              height: 36,
              fontSize: 14,
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {initials}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={600}>{displayName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{ color: "error.main", gap: 1 }}
            >
              <Logout fontSize="small" /> Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
            <Grid item xs={6} sm={3} key={key}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: "16px !important",
                  }}
                >
                  <Box sx={{ bgcolor: `${color}18`, borderRadius: 2, p: 1.2 }}>
                    <Icon sx={{ color, fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {stats[key] ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Controls */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200, bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            size="small"
            sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              {/* <MenuItem value="CANCELLED">Cancelled</MenuItem> */}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
          >
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTask(null);
              setTaskFormOpen(true);
            }}
            sx={{
              borderRadius: 2,
              py: 1,
              px: 2.5,
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            New Task
          </Button>
        </Box>

        {/* Active filter chips */}
        {(statusFilter || priorityFilter || debouncedSearch) && (
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            {debouncedSearch && (
              <Chip
                label={`Search: "${debouncedSearch}"`}
                size="small"
                onDelete={() => setSearch("")}
              />
            )}
            {statusFilter && (
              <Chip
                label={`Status: ${statusFilter.replace("_", " ")}`}
                size="small"
                color="primary"
                onDelete={() => setStatusFilter("")}
              />
            )}
            {priorityFilter && (
              <Chip
                label={`Priority: ${priorityFilter}`}
                size="small"
                color="secondary"
                onDelete={() => setPriorityFilter("")}
              />
            )}
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Task list */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <Assignment sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">No tasks found</Typography>
            <Typography variant="body2">
              {statusFilter || priorityFilter || debouncedSearch
                ? "Try clearing your filters"
                : "Create your first task to get started"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} lg={4} key={task.id}>
                <TaskCard
                  task={task}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteDialogId(id)}
                  onStatusChange={handleStatusChange}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Task Form Modal */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSaved={handleTaskSaved}
        task={editingTask}
      />

      {/* Delete Confirm */}
      <Dialog
        open={Boolean(deleteDialogId)}
        onClose={() => setDeleteDialogId(null)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDelete(deleteDialogId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
