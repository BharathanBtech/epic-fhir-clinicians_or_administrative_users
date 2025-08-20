import { Router } from 'express';
import { exchangeCodeForToken } from '../services/epicService';

const router = Router();

router.get('/', async (req, res) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing authorization code.');
  }

  console.log('Received callback from Epic.');
  console.log('Authorization code received:', code);

  try {
    const tokenData = await exchangeCodeForToken(code);
    console.log('Access token received successfully.');
    console.log('Access Token:', tokenData.access_token);

    // Store token in session or pass as query param
    (req as any).session.token = tokenData; // If using express-session
    (req as any).session.patientId = tokenData.patient

    res.redirect('/dashboard'); // Or wherever you want the user to go
  } catch (err: any) {
    console.error('Token exchange failed:', err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

export default router;
