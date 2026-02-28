import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../theme';

export default function CategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/questions/category/${category}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    navigation.navigate('Interview', {
      mode: 'category',
      category: category,
      questions: questions
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>{category}</Title>
            <Paragraph>Вопросов в категории: {questions.length}</Paragraph>
            <Button 
              mode="contained" 
              onPress={startInterview}
              style={styles.startButton}
              disabled={questions.length === 0}
            >
              Начать собеседование
            </Button>
          </Card.Content>
        </Card>

        {questions.map((question, index) => (
          <Card key={question.id} style={styles.questionCard}>
            <Card.Content>
              <View style={styles.questionHeader}>
                <Title style={styles.questionNumber}>Вопрос {index + 1}</Title>
                <Chip icon="tag" style={styles.chip}>
                  {question.difficulty}
                </Chip>
              </View>
              <Paragraph>{question.question}</Paragraph>
              {question.type === 'multiple_choice' && question.options && (
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optIndex) => (
                    <Chip key={optIndex} style={styles.optionChip}>
                      {option}
                    </Chip>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    elevation: 4,
  },
  startButton: {
    marginTop: 12,
  },
  questionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 18,
  },
  chip: {
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionChip: {
    margin: 4,
  },
});

