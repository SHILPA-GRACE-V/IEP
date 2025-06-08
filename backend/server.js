const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());



// Mock Login Auth
app.post('/api/login', (req, res) => {
  const { ssoId, password } = req.body;
  if (ssoId === 'david.johnson@bakerhughes.com' && password === 'password123') {
    return res.json({ success: true, token: 'mock-jwt-token', user: { name: 'David Johnson', role: 'Engineer' } });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});


const data = require('./data/extendeddashboarddata.json');

app.get('/api/dashboard-data', (req, res) => {
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});