import { Router } from 'express';
import { getPatientFundingSummary, getSpecificEOB, getPatientCoverage, getExplanationOfBenefits, getPractitionerByPatient, getOrganizationByPatient } from '../services/epicService.js';
// Helper functions removed - now using direct API data mapping
import { getConfig } from '../config/index.js';

const router = Router();

// Patient Funding Dashboard - Main entry point after patient selection
router.get('/', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const patientId = (req as any).session?.patientId;

  console.log('🚀 === FUNDING ROUTE TRIGGERED ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔗 Request URL:', req.url);
  console.log('🔗 Request path:', req.path);
  console.log('🔗 Request method:', req.method);
  console.log('🔗 Session ID:', req.sessionID);
  console.log('🔗 tokenData:', tokenData ? 'Present' : 'Missing');
  console.log('🔗 patientId:', patientId || 'Missing');
  console.log('🔗 User Agent:', req.get('User-Agent'));

  if (!tokenData || !patientId) {
    console.log('❌ Missing token or patientId, redirecting to /launch');
    return res.redirect('/launch');
  }

  try {
    console.log('📡 Fetching patient funding data...');
    const fundingData = await getPatientFundingSummary(tokenData.access_token, patientId);
    const config = getConfig();
    
    console.log('✅ Data fetched successfully:');
    console.log('   - Patient name:', fundingData.patient?.name);
    console.log('   - EOBs count:', fundingData.eobs?.length || 0);
    console.log('   - EOB IDs:', fundingData.eobs?.map((eob: any) => eob.id) || []);
    
    console.log('🎨 Rendering funding template...');
    console.log('   - Template name: funding');
    console.log('   - Views directory:', process.cwd() + '/dist/views');
    console.log('   - Template exists:', require('fs').existsSync(process.cwd() + '/dist/views/funding.ejs'));
    
    // Check template file contents to verify it's the updated version
    try {
      const fs = require('fs');
      const templatePath = process.cwd() + '/dist/views/funding.ejs';
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      console.log('📄 Template file size:', templateContent.length, 'characters');
      console.log('🔍 Template contains "eob-detail-card":', templateContent.includes('eob-detail-card'));
      console.log('🔍 Template contains "eob-table":', templateContent.includes('eob-table'));
      console.log('🔍 Template contains "Submit for Copay":', templateContent.includes('Submit for Copay'));
      console.log('🔍 Template contains "Sumit for copay":', templateContent.includes('Sumit for copay'));
      
      // Show first 200 characters of template
      console.log('📄 Template preview (first 200 chars):', templateContent.substring(0, 200));
    } catch (templateError) {
      console.error('❌ Error reading template file:', templateError);
    }
    
    res.render('funding', { 
      fundingData, 
      config,
      helpers: {
        calculateTotalAmount,
        calculatePatientResponsibility,
        calculateCopayAmount,
        calculateItemPatientResponsibility
      }
    });
    console.log('✅ Template rendered successfully');
    
  } catch (err: any) {
    console.error('❌ Failed to fetch patient funding data:', err.message);
    console.error('❌ Error stack:', err.stack);
    res.status(500).send('Error fetching patient funding data.');
  }
});

// Get specific EOB details with comprehensive information
router.get('/eob/:eobId', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const { eobId } = req.params;

  if (!tokenData || !eobId) {
    return res.status(400).json({ error: 'Missing token or EOB ID' });
  }

  try {
    const eobData = await getSpecificEOB(tokenData.access_token, eobId);
    
    // Transform the EOB data to include line items in the format needed for submission
    const transformedEOB = transformEOBForDisplay(eobData);
    
    res.json(transformedEOB);
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

// API endpoint for getting line items for a specific EOB
router.get('/api/eob/:eobId/line-items', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const { eobId } = req.params;

  if (!tokenData || !eobId) {
    return res.status(401).json({ error: 'Not authenticated or missing EOB ID' });
  }

  try {
    const eobData = await getSpecificEOB(tokenData.access_token, eobId);
    const lineItems = transformLineItems(eobData.item || []);
    res.json(lineItems);
  } catch (err: any) {
    console.error('Failed to fetch EOB line items:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for submitting EOB for copay processing
router.post('/api/eob/:eobId/submit-for-copay', async (req, res) => {
  const tokenData = (req as any).session?.token;
  const { eobId } = req.params;

  if (!tokenData || !eobId) {
    return res.status(401).json({ error: 'Not authenticated or missing EOB ID' });
  }

  try {
    // Get the EOB data
    const eobData = await getSpecificEOB(tokenData.access_token, eobId);
    
    // Transform to the required format for external system
    const submissionData = transformEOBForSubmission(eobData);
    
    // Simulate API call to external system
    const submissionResult = await simulateExternalAPICall(submissionData);
    
    // Store submission status in session for tracking
    if (!(req as any).session.submissions) {
      (req as any).session.submissions = {};
    }
    (req as any).session.submissions[eobId] = {
      status: submissionResult.status,
      submittedAt: new Date().toISOString(),
      trackingId: submissionResult.trackingId
    };
    
    res.json(submissionResult);
  } catch (err: any) {
    console.error('Failed to submit EOB for copay:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for getting submission status
router.get('/api/eob/:eobId/submission-status', async (req, res) => {
  const { eobId } = req.params;
  const submissions = (req as any).session?.submissions || {};
  
  const submission = submissions[eobId];
  if (!submission) {
    return res.json({ status: 'not_submitted' });
  }
  
  // Simulate status progression over time
  const status = simulateStatusProgression(submission);
  
  res.json({ 
    status,
    submittedAt: submission.submittedAt,
    trackingId: submission.trackingId
  });
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
    res.render('funding-dashboard', { 
      fundingData, 
      config,
      helpers: {
        calculateTotalAmount,
        calculatePatientResponsibility,
        calculateCopayAmount,
        calculateItemPatientResponsibility
      }
    });
  } catch (err: any) {
    console.error('Failed to fetch patient funding data:', err.message);
    res.status(500).send('Error fetching patient funding data.');
  }
});

export default router;

/**
 * Transform EOB data for display with comprehensive details
 */
function transformEOBForDisplay(eobData: any) {
  return {
    ...eobData,
    // Add computed fields for easier display
    totalAmount: calculateTotalAmount(eobData),
    patientResponsibility: calculatePatientResponsibility(eobData),
    lineItems: transformLineItems(eobData.item || [])
  };
}

/**
 * Transform EOB data for submission to external system
 */
function transformEOBForSubmission(eobData: any) {
  const lineItems = (eobData.item || []).map((item: any) => ({
    ProviderOrInsurance: getTextFromFHIR(item.productOrService),
    ServiceStartDate: item.servicedPeriod?.start || item.servicedDate || 'N/A',
    ServiceEndDate: item.servicedPeriod?.end || item.servicedDate || 'N/A',
    TotalAmount: item.net?.value || 0,
    PatientResponsibility: calculateItemPatientResponsibility(item)
  }));

  return {
    RemitTo: "Medical Center",
    SubmittedAmount: calculateTotalAmount(eobData),
    AddressLine1: "123 Medical St",
    City: "Houston",
    State: "TX",
    Zipcode: "77001",
    PartnerID: 1,
    PatientID: 3,
    lineItems: lineItems
  };
}

/**
 * Simulate external API call
 */
async function simulateExternalAPICall(submissionData: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return {
    status: 'claim_in_progress',
    trackingId: 'TRK_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    message: 'EOB submitted successfully for processing',
    submittedData: submissionData
  };
}

/**
 * Simulate status progression over time
 */
function simulateStatusProgression(submission: any) {
  const submittedAt = new Date(submission.submittedAt);
  const now = new Date();
  const hoursSinceSubmission = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
  
  // Simulate status progression based on time
  if (hoursSinceSubmission < 1) {
    return 'claim_in_progress';
  } else if (hoursSinceSubmission < 4) {
    return 'claim_under_review';
  } else if (hoursSinceSubmission < 8) {
    return Math.random() > 0.3 ? 'claim_approved' : 'claim_rejected';
  } else {
    return Math.random() > 0.2 ? 'claim_paid' : 'claim_denied';
  }
}

/**
 * Helper functions for data transformation - Using direct API data
 */
function calculateTotalAmount(eobData: any): number {
  // Look for "submitted/billed/charge" totals in the API response (supports mapped shapes)
  if (eobData.total && eobData.total.length > 0) {
    const submittedTotal = eobData.total.find((total: any) => {
      const categoryCode = total.categoryCode || total.category?.coding?.[0]?.code;
      const categoryText = getTextFromFHIR(total.category);
      const text = (categoryText || '').toLowerCase();
      return categoryCode === 'submitted' || text.includes('submitted') || text.includes('billed') || text.includes('charge');
    });
    if (submittedTotal) {
      const amt = submittedTotal.amount;
      return typeof amt === 'number' ? amt : (amt?.value || 0);
    }

    // Fallback to sum of all totals
    const sumTotals = eobData.total.reduce((sum: number, total: any) => {
      const amt = total.amount;
      const val = typeof amt === 'number' ? amt : (amt?.value || 0);
      return sum + (val || 0);
    }, 0);
    if (sumTotals > 0) return sumTotals;
  }

  // Final fallback: sum item net amounts
  if (eobData.item && eobData.item.length > 0) {
    return eobData.item.reduce((sum: number, item: any) => sum + (item.net?.value || item.net || 0), 0);
  }

  return 0;
}

function calculatePatientResponsibility(eobData: any): number {
  // Look for patient responsibility in totals or calculate from adjudications
  if (eobData.total && eobData.total.length > 0) {
    const patientTotal = eobData.total.find((total: any) => {
      const categoryText = getTextFromFHIR(total.category);
      return categoryText.toLowerCase().includes('patient') || 
             categoryText.toLowerCase().includes('responsibility') ||
             categoryText.toLowerCase().includes('copay') ||
             categoryText.toLowerCase().includes('deductible');
    });
    if (patientTotal) {
      const amt = patientTotal.amount;
      return typeof amt === 'number' ? amt : (amt?.value || 0);
    }
  }
  
  // If no total found, calculate from item adjudications
  if (eobData.item && eobData.item.length > 0) {
    let totalPatientResponsibility = 0;
    eobData.item.forEach((item: any) => {
      if (item.adjudication && item.adjudication.length > 0) {
        item.adjudication.forEach((adj: any) => {
          const categoryText = getTextFromFHIR(adj.category);
          if (categoryText.toLowerCase().includes('patient') || 
              categoryText.toLowerCase().includes('responsibility') ||
              categoryText.toLowerCase().includes('copay') ||
              categoryText.toLowerCase().includes('deductible')) {
            const amt = adj.amount;
            totalPatientResponsibility += (typeof amt === 'number') ? amt : (amt?.value || 0);
          }
        });
      }
    });
    return totalPatientResponsibility;
  }
  
  return 0;
}

function calculateCopayAmount(eobData: any): number {
  // Look for "copay" total in the API response
  if (eobData.total && eobData.total.length > 0) {
    const copayTotal = eobData.total.find((total: any) => {
      const categoryText = getTextFromFHIR(total.category);
      return categoryText.toLowerCase().includes('copay');
    });
    if (copayTotal) {
      const amt = copayTotal.amount;
      return typeof amt === 'number' ? amt : (amt?.value || 0);
    }
  }
  return 0;
}

function calculateItemPatientResponsibility(item: any): number {
  if (item.adjudication && item.adjudication.length > 0) {
    return item.adjudication.reduce((sum: number, adj: any) => {
      const categoryText = getTextFromFHIR(adj.category);
      if (categoryText.toLowerCase().includes('patient') || 
          categoryText.toLowerCase().includes('responsibility') ||
          categoryText.toLowerCase().includes('deductible') ||
          categoryText.toLowerCase().includes('copay')) {
        const amt = adj.amount;
        const val = (typeof amt === 'number') ? amt : (amt?.value || 0);
        return sum + val;
      }
      return sum;
    }, 0);
  }
  return item.net?.value || item.net || 0;
}

function transformLineItems(items: any[]): any[] {
  return items.map(item => ({
    service: getTextFromFHIR(item.productOrService),
    startDate: item.servicedPeriod?.start || item.servicedDate || 'N/A',
    endDate: item.servicedPeriod?.end || item.servicedDate || 'N/A',
    billedAmount: item.net?.value || 0,
    patientResponsibility: calculateItemPatientResponsibility(item),
    category: getTextFromFHIR(item.category),
    adjudications: item.adjudication?.map((adj: any) => ({
      category: getTextFromFHIR(adj.category),
      amount: adj.amount?.value || 0,
      reason: getTextFromFHIR(adj.reason)
    })) || []
  }));
}

function getTextFromFHIR(obj: any): string {
  if (!obj) return 'N/A';
  if (typeof obj === 'string') return obj;
  if (obj.text) return obj.text;
  if (obj.display) return obj.display;
  if (obj.value) return obj.value;
  if (obj.coding && obj.coding.length > 0) {
    return obj.coding[0].display || obj.coding[0].code || 'N/A';
  }
  return 'N/A';
}
