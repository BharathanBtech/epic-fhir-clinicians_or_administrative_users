import { Router } from 'express';
import { getPatientSummary } from '../services/epicService';

const router = Router();


router.get('/', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  console.log('Dashboard route triggered');
  console.log('tokenData:', tokenData);
  console.log('patientId:', patientId);

  if (!tokenData || !patientId) {
    return res.redirect('/');
  }

  try {
    const summary = await getPatientSummary(tokenData.access_token, patientId);
    res.render('dashboard', { summary });
  } catch (err: any) {
    console.error('Failed to fetch patient summary:', err.message);
    res.status(500).send('Error fetching patient data.');
  }
});

export default router;