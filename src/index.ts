import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import launchRouter from './routes/launch';
import callbackRouter from './routes/callback';
import patientRouter from './routes/patient';
//import summaryRoute from './routes/summary';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/launch', launchRouter);
app.use('/callback', callbackRouter);
app.use('/patient', patientRouter);
//app.use('/summary', summaryRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
