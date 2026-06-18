import { useState, useCallback } from 'react';
import * as taskApi from '../api/taskApi';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskApi.getTasks(params);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await taskApi.getTaskStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const { data } = await taskApi.createTask(taskData);
    setTasks((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const { data } = await taskApi.updateTask(id, taskData);
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, stats, loading, error, fetchTasks, fetchStats, createTask, updateTask, deleteTask };
};
