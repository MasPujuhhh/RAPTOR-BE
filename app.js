import 'dotenv/config'
import express from 'express';
import routes from './routes/router.js';
import cors from 'cors'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './config/connection.js';
import { QueryTypes } from 'sequelize';
import { results, paginateArray } from './helper/api.js';
import moment from 'moment';
import 'moment/locale/id.js'; 

moment.locale('id');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const port = 9101

app.use((req, res, next) => {
  req.moment = moment;
  next();
});

app.use('/assets/img', express.static(join(__dirname, 'assets/img')));
app.use('/assets/pdf', express.static(join(__dirname, 'assets/pdf')));
app.use('/assets/file', express.static(join(__dirname, 'assets/file')));
app.use(express.json());
app.use(cors())
// app.use(express.urlencoded());

app.use('/', routes);

app.use((req,res)=>{
  const err = new Error('endpoint tidak ada!!')
  err.code = 404
  res.status(err.code).json(results(null, err.code, {err}))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})