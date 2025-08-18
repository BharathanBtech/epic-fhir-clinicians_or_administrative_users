import { Router } from 'express';
import { generateState } from '../utils/state';

const router = Router();

router.get('/', (req, res) => {
  const state = generateState();
  const scope = encodeURIComponent('launch/patient openid fhirUser');

  const authRedirect = `${process.env.AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.REDIRECT_URI!
  )}&scope=${scope}&state=${state}&aud=${encodeURIComponent(process.env.FHIR_BASE!)}`;

  console.log('Generated state:', state);
  console.log('Redirecting user to Epic authorization URL...');
  console.log('Authorization URL:', authRedirect);

  res.redirect(authRedirect);
});

export default router;
