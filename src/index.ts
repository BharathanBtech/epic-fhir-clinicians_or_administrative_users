import express, { Request, Response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables
const CLIENT_ID = process.env.CLIENT_ID as string;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI as string;
const FHIR_BASE = process.env.FHIR_BASE as string;
const TOKEN_URL = process.env.TOKEN_URL as string;
const AUTH_URL = process.env.AUTH_URL as string;
const PORT = Number(process.env.PORT) || 4000;

// Step 1: Launch endpoint — redirect to Epic authorization URL
app.get('/launch', (req: Request, res: Response) => {
  const state = 'abc123'; // Can be dynamic
  const scope = encodeURIComponent('launch/patient openid fhirUser');

  const authRedirect = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${scope}&state=${state}&aud=${encodeURIComponent(FHIR_BASE)}`;

  res.redirect(authRedirect);
});

// Step 2: Callback — exchange code for access token
app.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  try {
    const tokenResponse = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = tokenResponse.data;
    const accessToken = tokenData.access_token;

    // Step 3: Call Epic FHIR Patient search
    const patientResponse = await axios.get(
      `${FHIR_BASE}/Patient?given=John&family=Smith`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json({
      token: tokenData,
      patientSearchResults: patientResponse.data
    });

  } catch (err: any) {
    console.error('Token exchange or API call failed:', err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
