import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import launchRouter from './routes/launch.js';
import callbackRouter from './routes/callback.js';
import patientRouter from './routes/patient.js';
import summaryRoute from './routes/summary.js';
import dashboardRouter from './routes/dashboard.js';
import fundingRouter from './routes/funding.js';
import patientSearchRouter from './routes/patient-search.js';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, 'views'));

app.use('/launch', launchRouter);
app.use('/callback', callbackRouter);
app.use('/patient', patientRouter);
app.use('/summary', summaryRoute);
app.use('/dashboard', dashboardRouter);
app.use('/funding', fundingRouter);
app.use('/patient-search', patientSearchRouter);

app.get('/', (req, res) => {
  res.redirect('/patient-search');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
