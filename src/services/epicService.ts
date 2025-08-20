import axios from 'axios';

export async function exchangeCodeForToken(code: string) {
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

  return response.data;
}

export async function searchPatient(token: string, given: string, family: string) {
  const response = await axios.get(
    `${process.env.FHIR_BASE}/Patient?given=${given}&family=${family}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return response.data;
}

 export async function getPatientSummary(token: string, patientId: string) {
  const headers = { Authorization: `Bearer ${token}` };

  const [patient, conditions, medications, allergies] = await Promise.all([
    axios.get(`${process.env.FHIR_BASE}/Patient/${patientId}`, { headers }),
    axios.get(`${process.env.FHIR_BASE}/Condition?patient=${patientId}`, { headers }),
    axios.get(`${process.env.FHIR_BASE}/MedicationRequest?patient=${patientId}`, { headers }),
    axios.get(`${process.env.FHIR_BASE}/AllergyIntolerance?patient=${patientId}`, { headers })
  ]);

  return {
    demographics: {
      name: patient.data.name?.[0]?.text,
      gender: patient.data.gender,
      birthDate: patient.data.birthDate
    },
    conditions: conditions.data.entry?.map((e: any) => e.resource.code?.text) || [],
    medications: medications.data.entry?.map((e: any) => e.resource.medicationCodeableConcept?.text) || [],
    allergies: allergies.data.entry?.map((e: any) => e.resource.code?.text) || []
  };
}

