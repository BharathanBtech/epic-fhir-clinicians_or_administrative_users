import { Router } from 'express';
import { generateState } from '../utils/state.js';

const router = Router();

// Patient Search Landing Page
router.get('/', (req, res) => {
  res.render('patient-search');
});

// Initiate Epic Patient Search Launch
router.get('/launch', (req, res) => {
  const state = generateState();
  const scope = encodeURIComponent('launch/patient openid fhirUser');

  const authRedirect = `${process.env.AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.REDIRECT_URI!
  )}&scope=${scope}&state=${state}&aud=${encodeURIComponent(process.env.FHIR_BASE!)}`;

  console.log('Generated state:', state);
  console.log('Redirecting user to Epic patient search...');
  console.log('Authorization URL:', authRedirect);

  res.redirect(authRedirect);
});

export default router;
