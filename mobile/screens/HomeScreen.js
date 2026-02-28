import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../theme';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setError(null);
    setLoading(true);
    try {
      // Попробуем сначала через fetch (нативный API)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      let errorMessage = 'Не удалось загрузить.\n\n';
      
      if (err.name === 'AbortError') {
        errorMessage += 'Таймаут запроса (10 сек). Проверьте, что backend запущен.';
      } else if (err.message) {
        errorMessage += `Ошибка: ${err.message}\n\n`;
      } else {
        errorMessage += `Ошибка: ${String(err)}\n\n`;
      }
      
      errorMessage += `Проверьте:\n• Backend запущен (node server.js)\n• Телефон в той же Wi‑Fi, что и ПК\n• IP: ${API_URL}\n\n`;
      errorMessage += `Попробуйте открыть в браузере телефона:\n${API_URL.replace('/api', '/api/categories')}`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startRandomInterview = () => {
    navigation.navigate('Interview', { 
      mode: 'random',
      count: 10 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Загрузка...</Paragraph>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Title style={styles.errorTitle}>Ошибка загрузки</Title>
            <Paragraph style={styles.errorText}>{error}</Paragraph>
            <Button mode="contained" onPress={loadCategories} style={styles.retryButton}>
              Повторить
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title>Добро пожаловать!</Title>
            <Paragraph>
              Выберите категорию для подготовки к собеседованию или начните случайный тест.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.quickStartCard}>
          <Card.Content>
            <Title>Быстрый старт</Title>
            <Paragraph>Пройдите случайный тест из 10 вопросов</Paragraph>
            <Button 
              mode="contained" 
              onPress={startRandomInterview}
              style={styles.button}
            >
              Начать тест
            </Button>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Категории</Title>
        {categories.map((category, index) => (
          <Card 
            key={index} 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Category', { category })}
          >
            <Card.Content>
              <Title>{category}</Title>
              <Paragraph>Вопросы по категории {category}</Paragraph>
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
  loadingText: {
    marginTop: 12,
  },
  errorCard: {
    margin: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#b00020',
  },
  errorTitle: {
    color: '#b00020',
  },
  errorText: {
    marginVertical: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    elevation: 4,
  },
  quickStartCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  button: {
    marginTop: 12,
  },
  sectionTitle: {
    margin: 16,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
});

