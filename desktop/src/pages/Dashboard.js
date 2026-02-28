import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    categories: [],
    statistics: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [questionsRes, categoriesRes, statisticsRes] = await Promise.all([
        axios.get(`${API_URL}/questions`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/statistics`),
      ]);

      setStats({
        totalQuestions: questionsRes.data.length,
        categories: categoriesRes.data,
        statistics: statisticsRes.data,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего вопросов
              </Typography>
              <Typography variant="h3">{stats.totalQuestions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Категорий
              </Typography>
              <Typography variant="h3">{stats.categories.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего ответов
              </Typography>
              <Typography variant="h3">
                {stats.statistics.reduce((sum, stat) => sum + (stat.total_answers || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика по категориям
              </Typography>
              {stats.statistics.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {stats.statistics.map((stat, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1">{stat.category}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {stat.correct_answers || 0} / {stat.total_answers || 0} правильных
                          ({stat.success_rate || 0}%)
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${stat.success_rate || 0}%`,
                            backgroundColor: '#6200ee',
                            transition: 'width 0.3s',
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Нет данных о статистике
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

