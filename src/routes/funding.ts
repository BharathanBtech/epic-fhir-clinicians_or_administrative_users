import { Router } from 'express';
import { getPatientFundingSummary, getSpecificEOB, getPatientCoverage, getExplanationOfBenefits, getPractitionerByPatient, getOrganizationByPatient } from '../services/epicService.js';
import { getConfig } from '../config/index.js';

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
    const config = getConfig();
    res.render('funding', { fundingData, config });
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

// API endpoint for refreshing insurance coverage only
router.get('/api/insurance', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  if (!tokenData || !patientId) {
    return res.status(401).json({ error: 'Not authenticated or no patient selected' });
  }

  try {
    const coverage = await getPatientCoverage(tokenData.access_token, patientId);
    res.json({ coverage });
  } catch (err: any) {
    console.error('Failed to fetch insurance coverage:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for refreshing EOB data only
router.get('/api/eob', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  if (!tokenData || !patientId) {
    return res.status(401).json({ error: 'Not authenticated or no patient selected' });
  }

  try {
    const eobs = await getExplanationOfBenefits(tokenData.access_token, patientId);
    res.json({ eobs });
  } catch (err: any) {
    console.error('Failed to fetch EOB data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for refreshing practitioner data only
router.get('/api/practitioners', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  if (!tokenData || !patientId) {
    return res.status(401).json({ error: 'Not authenticated or no patient selected' });
  }

  try {
    const practitioners = await getPractitionerByPatient(patientId, tokenData.access_token);
    res.json(practitioners);
  } catch (err: any) {
    console.error('Failed to fetch practitioner data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for refreshing organization data only
router.get('/api/organizations', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  if (!tokenData || !patientId) {
    return res.status(401).json({ error: 'Not authenticated or no patient selected' });
  }

  try {
    const organizations = await getOrganizationByPatient(patientId, tokenData.access_token);
    res.json(organizations);
  } catch (err: any) {
    console.error('Failed to fetch organization data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// New Dashboard with Sidebar Navigation
router.get('/dashboard', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;
  
  if (!tokenData || !patientId) {
    res.status(401).send('Authentication required. Please login first.');
    return;
  }
  
  try {
    const fundingData = await getPatientFundingSummary(tokenData.access_token, patientId);
    const config = getConfig();
    res.render('funding-dashboard', { fundingData, config });
  } catch (err: any) {
    console.error('Failed to fetch patient funding data:', err.message);
    res.status(500).send('Error fetching patient funding data.');
  }
});

export default router;
