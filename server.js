const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/files', (req, res) => {
  try {
    const data = fs.readFileSync('images.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading images.json:', err);
    res.status(500).send('Error reading images.json');
  }
});

// Handle uploads
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const name = req.body.name;
  const author = req.body.author;
  const theme = req.body.theme;
  const description = req.body.description;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileUrl = `http://localhost:5000/uploads/${file.filename}`;

  try {
    const data = fs.existsSync('images.json') ? JSON.parse(fs.readFileSync('images.json', 'utf8')) : [];
    data.push({ src: fileUrl, title: name, author: author, theme: theme, description: description });
    fs.writeFileSync('images.json', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to images.json:', err);
    return res.status(500).send('Error saving file data.');
  }

  res.json({ fileUrl, title: name, theme });
});

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index.html not found');
  }
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
