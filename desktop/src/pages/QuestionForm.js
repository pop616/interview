import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

export default function QuestionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    type: 'text',
    options: [],
    correct_answer: '',
    difficulty: 'medium',
  });
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`);
      const question = response.data.find(q => q.id === id);
      if (question) {
        setFormData({
          category: question.category,
          question: question.question,
          type: question.type,
          options: question.options || [],
          correct_answer: question.correct_answer,
          difficulty: question.difficulty,
        });
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()],
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/questions/${id}`, formData);
      } else {
        await axios.post(`${API_URL}/questions`, formData);
      }
      navigate('/questions');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Ошибка при сохранении вопроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактировать вопрос' : 'Создать вопрос'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Категория"
              value={formData.category}
              onChange={handleChange('category')}
              required
              fullWidth
            />

            <TextField
              label="Вопрос"
              value={formData.question}
              onChange={handleChange('question')}
              required
              fullWidth
              multiline
              rows={4}
            />

            <FormControl fullWidth>
              <InputLabel>Тип вопроса</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Тип вопроса"
              >
                <MenuItem value="text">Текстовый ответ</MenuItem>
                <MenuItem value="multiple_choice">Выбор из вариантов</MenuItem>
              </Select>
            </FormControl>

            {formData.type === 'multiple_choice' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Варианты ответов
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    label="Новый вариант"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    fullWidth
                  />
                  <Button variant="outlined" onClick={handleAddOption}>
                    Добавить
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.options.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      onDelete={() => handleRemoveOption(index)}
                      color={option === formData.correct_answer ? 'primary' : 'default'}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <TextField
              label="Правильный ответ"
              value={formData.correct_answer}
              onChange={handleChange('correct_answer')}
              required
              fullWidth
              helperText={
                formData.type === 'multiple_choice'
                  ? 'Выберите один из вариантов выше'
                  : ''
              }
            />

            <FormControl fullWidth>
              <InputLabel>Сложность</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={handleChange('difficulty')}
                label="Сложность"
              >
                <MenuItem value="easy">Легкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="hard">Сложный</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/questions')}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

