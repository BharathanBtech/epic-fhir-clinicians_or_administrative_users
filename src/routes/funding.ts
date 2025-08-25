import { Router } from 'express';
import { getPatientFundingSummary, getSpecificEOB } from '../services/epicService.js';

const router = Router();

// Patient Funding Dashboard - Main entry point after patient selection
router.get('/', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  console.log('Funding route triggered');
  console.log('tokenData:', tokenData);
  console.log('patientId:', patientId);

  if (!tokenData || !patientId) {
    return res.redirect('/launch');
  }

  try {
    const fundingData = await getPatientFundingSummary(tokenData.access_token, patientId);
    res.render('funding', { fundingData });
  } catch (err: any) {
    console.error('Failed to fetch patient funding data:', err.message);
    res.status(500).send('Error fetching patient funding data.');
  }
});

// Get specific EOB details
router.get('/eob/:eobId', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const { eobId } = req.params;

  if (!tokenData || !eobId) {
    return res.status(400).json({ error: 'Missing token or EOB ID' });
  }

  try {
    const eobData = await getSpecificEOB(tokenData.access_token, eobId);
    res.json(eobData);
  } catch (err: any) {
    console.error('Failed to fetch EOB details:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for getting funding summary (for AJAX calls)
router.get('/api/summary', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  if (!tokenData || !patientId) {
    return res.status(401).json({ error: 'Not authenticated or no patient selected' });
  }

  try {
    const fundingData = await getPatientFundingSummary(tokenData.access_token, patientId);
    res.json(fundingData);
  } catch (err: any) {
    console.error('Failed to fetch funding summary:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
