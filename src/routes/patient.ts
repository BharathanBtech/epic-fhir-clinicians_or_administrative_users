import { Router } from 'express';
import { searchPatient } from '../services/epicService.js';

const router = Router();

router.get('/', async (req, res) => {
  const { given = 'John', family = 'Smith', token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).send('Missing access token.');
  }

  try {
    const patientData = await searchPatient(token, given as string, family as string);
    console.log('Patient search successful. Returning data to client.');
    res.json(patientData);
  } catch (err: any) {
    console.error('Patient search failed:', err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

export default router;
