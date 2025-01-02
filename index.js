const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.options("*", cors());

const userRoutes = require('./routes/userRoutes');

// Define the base API path
const api = '/api';

// Middleware
app.use(bodyParser.json());

// Use the user routes with the base API path
app.use(`${api}/user`, userRoutes);

// Database Connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "test",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
