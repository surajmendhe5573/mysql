const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', require('./routes/user'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
