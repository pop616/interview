const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const dbPath = path.join(__dirname, 'interview.db');
const db = new sqlite3.Database(dbPath);


db.serialize(() => {
  
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    options TEXT,
    correct_answer TEXT,
    difficulty TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS candidate_answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    answer TEXT,
    is_correct INTEGER,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    score INTEGER,
    total_questions INTEGER
  )`);

  
  const testQuestions = [
    {
      id: uuidv4(),
      category: 'JavaScript',
      question: 'Что такое замыкание (closure) в JavaScript?',
      type: 'text',
      difficulty: 'medium',
      correct_answer: 'Функция, которая имеет доступ к переменным из внешней области видимости'
    },
    {
      id: uuidv4(),
      category: 'JavaScript',
      question: 'Какой метод массива используется для создания нового массива с результатами вызова функции для каждого элемента?',
      type: 'multiple_choice',
      options: JSON.stringify(['forEach', 'map', 'filter', 'reduce']),
      difficulty: 'easy',
      correct_answer: 'map'
    },
    {
      id: uuidv4(),
      category: 'React',
      question: 'Что такое JSX?',
      type: 'text',
      difficulty: 'easy',
      correct_answer: 'Синтаксическое расширение JavaScript, которое позволяет писать HTML-подобный код'
    },
    {
      id: uuidv4(),
      category: 'React',
      question: 'Какой хук используется для управления состоянием в функциональных компонентах?',
      type: 'multiple_choice',
      options: JSON.stringify(['useEffect', 'useState', 'useContext', 'useReducer']),
      difficulty: 'easy',
      correct_answer: 'useState'
    },
    {
      id: uuidv4(),
      category: 'Алгоритмы',
      question: 'Какая временная сложность у бинарного поиска?',
      type: 'multiple_choice',
      options: JSON.stringify(['O(n)', 'O(log n)', 'O(n log n)', 'O(1)']),
      difficulty: 'medium',
      correct_answer: 'O(log n)'
    }
  ];

  const stmt = db.prepare(`INSERT OR IGNORE INTO questions (id, category, question, type, options, correct_answer, difficulty) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  
  testQuestions.forEach(q => {
    stmt.run(q.id, q.category, q.question, q.type, q.options || null, q.correct_answer, q.difficulty);
  });
  stmt.finalize();
});




app.get('/api/questions', (req, res) => {
  db.all('SELECT * FROM questions ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const questions = rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
    res.json(questions);
  });
});


app.get('/api/questions/category/:category', (req, res) => {
  const { category } = req.params;
  db.all('SELECT id, category, question, type, options, difficulty FROM questions WHERE category = ?', 
    [category], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const questions = rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
    res.json(questions);
  });
});


app.get('/api/questions/random/:count', (req, res) => {
  const count = parseInt(req.params.count) || 10;
  db.all('SELECT id, category, question, type, options, difficulty FROM questions ORDER BY RANDOM() LIMIT ?', 
    [count], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const questions = rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
    res.json(questions);
  });
});


app.get('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT id, category, question, type, options, difficulty FROM questions WHERE id = ?', 
    [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    res.json({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    });
  });
});


app.post('/api/questions', (req, res) => {
  const { category, question, type, options, correct_answer, difficulty } = req.body;
  const id = uuidv4();
  
  const optionsStr = options ? JSON.stringify(options) : null;
  
  db.run(
    'INSERT INTO questions (id, category, question, type, options, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, category, question, type, optionsStr, correct_answer, difficulty || 'medium'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, category, question, type, options, correct_answer, difficulty });
    }
  );
});


app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const { category, question, type, options, correct_answer, difficulty } = req.body;
  
  const optionsStr = options ? JSON.stringify(options) : null;
  
  db.run(
    'UPDATE questions SET category = ?, question = ?, type = ?, options = ?, correct_answer = ?, difficulty = ? WHERE id = ?',
    [category, question, type, optionsStr, correct_answer, difficulty, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Question updated successfully' });
    }
  );
});


app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Question deleted successfully' });
  });
});


app.post('/api/questions/:id/check', (req, res) => {
  const { id } = req.params;
  const { answer, candidate_id } = req.body;
  
  db.get('SELECT correct_answer FROM questions WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    
    const isCorrect = answer.toLowerCase().trim() === row.correct_answer.toLowerCase().trim();
    
    
    const answerId = uuidv4();
    db.run(
      'INSERT INTO candidate_answers (id, question_id, candidate_id, answer, is_correct) VALUES (?, ?, ?, ?, ?)',
      [answerId, id, candidate_id || 'anonymous', answer, isCorrect ? 1 : 0]
    );
    
    res.json({ is_correct: isCorrect, correct_answer: row.correct_answer });
  });
});


app.post('/api/answers', (req, res) => {
  const { question_id, candidate_id, answer } = req.body;
  const id = uuidv4();
  
  db.get('SELECT correct_answer FROM questions WHERE id = ?', [question_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const isCorrect = row && answer.toLowerCase().trim() === row.correct_answer.toLowerCase().trim();
    
    db.run(
      'INSERT INTO candidate_answers (id, question_id, candidate_id, answer, is_correct) VALUES (?, ?, ?, ?, ?)',
      [id, question_id, candidate_id || 'anonymous', answer, isCorrect ? 1 : 0],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id, is_correct: isCorrect });
      }
    );
  });
});


app.get('/api/statistics', (req, res) => {
  db.all(`
    SELECT 
      q.category,
      COUNT(ca.id) as total_answers,
      SUM(ca.is_correct) as correct_answers,
      ROUND(SUM(ca.is_correct) * 100.0 / COUNT(ca.id), 2) as success_rate
    FROM questions q
    LEFT JOIN candidate_answers ca ON q.id = ca.question_id
    GROUP BY q.category
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM questions ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});


app.post('/api/sessions', (req, res) => {
  const { candidate_id, total_questions } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO interview_sessions (id, candidate_id, total_questions) VALUES (?, ?, ?)',
    [id, candidate_id || 'anonymous', total_questions || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, candidate_id, started_at: new Date().toISOString() });
    }
  );
});


app.put('/api/sessions/:id/complete', (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  
  db.run(
    'UPDATE interview_sessions SET completed_at = CURRENT_TIMESTAMP, score = ? WHERE id = ?',
    [score, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Session completed' });
    }
  );
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Доступ с телефона: http://ВАШ_IP:${PORT}/api`);
});

