import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, ProgressBar } from 'react-native-paper';

export default function ResultsScreen({ route, navigation }) {
  const { total, correct, results } = route.params;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>Результаты собеседования</Title>
            <View style={styles.scoreContainer}>
              <Title style={[styles.score, { color: getScoreColor() }]}>
                {correct} / {total}
              </Title>
              <Paragraph style={styles.percentage}>{percentage}%</Paragraph>
            </View>
            <ProgressBar 
              progress={percentage / 100} 
              color={getScoreColor()} 
              style={styles.progressBar}
            />
            <Paragraph style={styles.summaryText}>
              {percentage >= 80 
                ? 'Отличный результат! Вы хорошо подготовлены.'
                : percentage >= 60
                ? 'Хороший результат. Есть что улучшить.'
                : 'Нужно больше практики. Продолжайте готовиться!'}
            </Paragraph>
          </Card.Content>
        </Card>

        <Title style={styles.detailsTitle}>Детали ответов</Title>
        {results.map((result, index) => (
          <Card 
            key={index} 
            style={[
              styles.resultCard,
              result.is_correct ? styles.correctCard : styles.incorrectCard
            ]}
          >
            <Card.Content>
              <View style={styles.resultHeader}>
                <Title style={styles.questionNumber}>Вопрос {index + 1}</Title>
                <Chip 
                  icon={result.is_correct ? 'check' : 'close'}
                  style={[
                    styles.statusChip,
                    result.is_correct ? styles.correctChip : styles.incorrectChip
                  ]}
                >
                  {result.is_correct ? 'Правильно' : 'Неправильно'}
                </Chip>
              </View>
              <Paragraph style={styles.questionText}>{result.question.question}</Paragraph>
              <Paragraph style={styles.answerLabel}>Ваш ответ:</Paragraph>
              <Paragraph style={styles.answerText}>{result.answer || 'Не отвечено'}</Paragraph>
              {!result.is_correct && (
                <>
                  <Paragraph style={styles.correctAnswerLabel}>Правильный ответ:</Paragraph>
                  <Paragraph style={styles.correctAnswerText}>{result.correct_answer}</Paragraph>
                </>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Вернуться на главную
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 24,
    marginTop: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  summaryText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  detailsTitle: {
    margin: 16,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  incorrectCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 18,
  },
  statusChip: {
    marginLeft: 8,
  },
  correctChip: {
    backgroundColor: '#c8e6c9',
  },
  incorrectChip: {
    backgroundColor: '#ffcdd2',
  },
  questionText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  answerLabel: {
    marginTop: 12,
    fontSize: 12,
    color: '#757575',
  },
  answerText: {
    marginTop: 4,
  },
  correctAnswerLabel: {
    marginTop: 12,
    fontSize: 12,
    color: '#757575',
    fontWeight: 'bold',
  },
  correctAnswerText: {
    marginTop: 4,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    paddingVertical: 4,
  },
});

