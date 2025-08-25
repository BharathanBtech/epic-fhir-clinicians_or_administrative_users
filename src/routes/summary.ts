import { Router } from 'express';
import { getPatientSummary } from '../services/epicService.js';

const router = Router();

router.get('/', async (req, res) => {
  const { patientId, token } = req.query;

  if (!patientId || !token || typeof token !== 'string') {
    return res.status(400).send('Missing patient ID or access token.');
  }

  try {
    const summary = await getPatientSummary(token, patientId as string);
    res.json(summary);
  } catch (err: any) {
    console.error('Failed to fetch patient summary:', err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

export default router;
