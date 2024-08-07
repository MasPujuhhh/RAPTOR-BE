import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes/router.js';
import sequelize from './config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from './helper/api.js';
import moment from 'moment';
import 'moment/locale/id.js';

moment.locale('id');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 9101;

// Middleware untuk CORS
const corsOptions = {
  origin: '*', // Mengizinkan semua origin, ganti dengan URL frontend Anda untuk keamanan lebih
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Metode HTTP yang diizinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
  optionsSuccessStatus: 200 // Untuk memastikan browser menerima preflight response
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.options('*', (req, res) => {
  console.log('OPTIONS request received');
  res.sendStatus(200); // Kirim status 200 untuk OPTIONS request
});

// Middleware untuk parsing JSON dan URL-encoded body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk moment.js
app.use((req, res, next) => {
  req.moment = moment;
  next();
});

// Static file serving
app.use('/assets/img', express.static(join(__dirname, 'assets/img')));
app.use('/assets/pdf', express.static(join(__dirname, 'assets/pdf')));
app.use('/assets/file', express.static(join(__dirname, 'assets/file')));

// Routing
app.use('/', routes);

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// Error handling untuk endpoint yang tidak ada
app.use((req, res) => {
  const err = new Error('Endpoint tidak ada!!');
  err.code = 404;
  res.status(err.code).json(results(null, err.code, { err }));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

