import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Title, Paragraph, TextInput, Button, RadioButton, ProgressBar, Chip } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../theme';
import * as Crypto from 'expo-crypto';

// Функция для генерации UUID v4
const generateUUID = () => {
  try {
    // Пытаемся использовать expo-crypto
    if (Crypto.randomUUID) {
      return Crypto.randomUUID();
    }
  } catch (e) {
    // Если не работает, используем альтернативный метод
  }
  
  // Альтернативная генерация UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function InterviewScreen({ route, navigation }) {
  const { mode, category, questions: preloadedQuestions, count } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [candidateId] = useState(() => generateUUID());

  useEffect(() => {
    loadQuestions();
    createSession();
  }, []);

  const loadQuestions = async () => {
    try {
      let response;
      if (mode === 'random') {
        response = await axios.get(`${API_URL}/questions/random/${count || 10}`);
      } else if (mode === 'category' && preloadedQuestions) {
        setQuestions(preloadedQuestions);
        setLoading(false);
        return;
      } else {
        response = await axios.get(`${API_URL}/questions/category/${category}`);
      }
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const response = await axios.post(`${API_URL}/sessions`, {
        candidate_id: candidateId,
        total_questions: count || 10
      });
      setSessionId(response.data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    const answer = answers[currentQuestion.id];

    if (answer) {
      // Сохраняем ответ
      try {
        await axios.post(`${API_URL}/answers`, {
          question_id: currentQuestion.id,
          candidate_id: candidateId,
          answer: answer
        });
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Завершаем собеседование
      finishInterview();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishInterview = async () => {
    // Подсчитываем результаты
    let correctCount = 0;
    const results = [];

    for (const question of questions) {
      const answer = answers[question.id];
      if (answer) {
        try {
          const checkResponse = await axios.post(`${API_URL}/questions/${question.id}/check`, {
            answer: answer,
            candidate_id: candidateId
          });
          if (checkResponse.data.is_correct) {
            correctCount++;
          }
          results.push({
            question,
            answer,
            is_correct: checkResponse.data.is_correct,
            correct_answer: checkResponse.data.correct_answer
          });
        } catch (error) {
          console.error('Error checking answer:', error);
        }
      }
    }

    // Завершаем сессию
    if (sessionId) {
      try {
        await axios.put(`${API_URL}/sessions/${sessionId}/complete`, {
          score: correctCount
        });
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }

    navigation.navigate('Results', {
      total: questions.length,
      correct: correctCount,
      results: results
    });
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Загрузка вопросов...</Paragraph>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const currentAnswer = answers[currentQuestion.id] || '';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progressContainer}>
        <Paragraph>Вопрос {currentIndex + 1} из {questions.length}</Paragraph>
        <ProgressBar progress={progress} color="#6200ee" style={styles.progressBar} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <View style={styles.questionHeader}>
              <Title>{currentQuestion.question}</Title>
              <Chip icon="tag" style={styles.chip}>
                {currentQuestion.difficulty}
              </Chip>
            </View>
            <Paragraph style={styles.category}>Категория: {currentQuestion.category}</Paragraph>

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <RadioButton.Group
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                value={currentAnswer}
              >
                {currentQuestion.options.map((option, index) => (
                  <View key={index} style={styles.radioOption}>
                    <RadioButton value={option} />
                    <Paragraph style={styles.radioLabel}>{option}</Paragraph>
                  </View>
                ))}
              </RadioButton.Group>
            ) : (
              <TextInput
                label="Ваш ответ"
                value={currentAnswer}
                onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={styles.button}
        >
          Назад
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
        >
          {currentIndex === questions.length - 1 ? 'Завершить' : 'Далее'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    margin: 16,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chip: {
    marginLeft: 8,
  },
  category: {
    marginTop: 8,
    color: '#757575',
    fontStyle: 'italic',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  radioLabel: {
    marginLeft: 8,
    flex: 1,
  },
  textInput: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

