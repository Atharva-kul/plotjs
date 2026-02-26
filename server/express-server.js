const express = require('express');
const path = require('path');
const app = express();
const port = 8000; // Or any port you prefer

// Serve static files from the demo and src directories
app.use(express.static(path.join(__dirname, '..', 'demo')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'demo', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
