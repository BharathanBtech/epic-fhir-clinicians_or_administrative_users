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

    res.json({ token: tokenData });
  } catch (err: any) {
    console.error('Token exchange failed:', err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

export default router;
