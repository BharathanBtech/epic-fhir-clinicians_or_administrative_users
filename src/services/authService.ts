import axios from 'axios';

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<any> {
  console.log('🔐 Exchanging authorization code for token...');
  
  try {
    const response = await axios.post(
      process.env.TOKEN_URL!,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI!,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    
    console.log('✅ Token exchange successful');
    return response.data;
  } catch (error) {
    console.error('❌ Token exchange failed:', error);
    throw error;
  }
}

/**
 * Validate token and extract patient context
 */
export function validateTokenResponse(tokenData: any): { accessToken: string; patientId: string } {
  if (!tokenData.access_token) {
    throw new Error('No access token received from Epic');
  }
  
  if (!tokenData.patient) {
    throw new Error('No patient context received from Epic');
  }
  
  return {
    accessToken: tokenData.access_token,
    patientId: tokenData.patient
  };
}
