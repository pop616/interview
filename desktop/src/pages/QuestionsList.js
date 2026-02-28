import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, question: null });
  const [filter, setFilter] = useState({ category: 'all', difficulty: 'all' });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/questions/${deleteDialog.question.id}`);
      setQuestions(questions.filter(q => q.id !== deleteDialog.question.id));
      setDeleteDialog({ open: false, question: null });
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Ошибка при удалении вопроса');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter.category !== 'all' && q.category !== filter.category) return false;
    if (filter.difficulty !== 'all' && q.difficulty !== filter.difficulty) return false;
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Вопросы</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/questions/new')}
        >
          Добавить вопрос
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          select
          label="Категория"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Все категории</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Сложность"
          value={filter.difficulty}
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Все уровни</MenuItem>
          <MenuItem value="easy">Легкий</MenuItem>
          <MenuItem value="medium">Средний</MenuItem>
          <MenuItem value="hard">Сложный</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Вопрос</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Сложность</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">Нет вопросов</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400 }}>
                      {question.question.length > 100
                        ? `${question.question.substring(0, 100)}...`
                        : question.question}
                    </Typography>
                  </TableCell>
                  <TableCell>{question.category}</TableCell>
                  <TableCell>
                    {question.type === 'multiple_choice' ? 'Выбор' : 'Текст'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={question.difficulty}
                      color={getDifficultyColor(question.difficulty)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/questions/edit/${question.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, question })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, question: null })}>
        <DialogTitle>Удалить вопрос?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот вопрос? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, question: null })}>
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

