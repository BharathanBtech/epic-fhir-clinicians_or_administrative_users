import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';

import launchRouter from './routes/launch';
import callbackRouter from './routes/callback';
import patientRouter from './routes/patient';
import summaryRoute from './routes/summary';
import dashboardRouter from './routes/dashboard';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use('/launch', launchRouter);
app.use('/callback', callbackRouter);
app.use('/patient', patientRouter);
app.use('/summary', summaryRoute);
app.use('/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Epic FHIR Integration!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
