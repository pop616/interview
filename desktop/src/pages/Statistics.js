import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

export default function Statistics() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  const totalAnswers = statistics.reduce((sum, stat) => sum + (stat.total_answers || 0), 0);
  const totalCorrect = statistics.reduce((sum, stat) => sum + (stat.correct_answers || 0), 0);
  const overallSuccessRate = totalAnswers > 0 
    ? ((totalCorrect / totalAnswers) * 100).toFixed(2) 
    : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего ответов
              </Typography>
              <Typography variant="h3">{totalAnswers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Правильных ответов
              </Typography>
              <Typography variant="h3">{totalCorrect}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Общий процент успеха
              </Typography>
              <Typography variant="h3">{overallSuccessRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Категория</TableCell>
              <TableCell align="right">Всего ответов</TableCell>
              <TableCell align="right">Правильных</TableCell>
              <TableCell align="right">Неправильных</TableCell>
              <TableCell align="right">Процент успеха</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statistics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">Нет данных</Typography>
                </TableCell>
              </TableRow>
            ) : (
              statistics.map((stat, index) => {
                const incorrect = (stat.total_answers || 0) - (stat.correct_answers || 0);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {stat.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{stat.total_answers || 0}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      {stat.correct_answers || 0}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      {incorrect}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={
                          parseFloat(stat.success_rate || 0) >= 80
                            ? 'success.main'
                            : parseFloat(stat.success_rate || 0) >= 60
                            ? 'warning.main'
                            : 'error.main'
                        }
                      >
                        {stat.success_rate || 0}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

