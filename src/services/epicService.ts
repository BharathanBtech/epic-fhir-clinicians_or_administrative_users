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

// New functions for Patient Funding & Payment Automation

export async function getPatientDetails(token: string, patientId: string) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const response = await axios.get(`${process.env.FHIR_BASE}/Patient/${patientId}`, { headers });
  
  return {
    id: response.data.id,
    mrn: response.data.identifier?.find((id: any) => id.system?.includes('MRN'))?.value,
    name: response.data.name?.[0]?.text || `${response.data.name?.[0]?.given?.join(' ')} ${response.data.name?.[0]?.family}`,
    given: response.data.name?.[0]?.given?.join(' '),
    family: response.data.name?.[0]?.family,
    gender: response.data.gender,
    birthDate: response.data.birthDate,
    address: response.data.address?.[0],
    phone: response.data.telecom?.find((t: any) => t.system === 'phone')?.value,
    email: response.data.telecom?.find((t: any) => t.system === 'email')?.value
  };
}

export async function getPatientCoverage(token: string, patientId: string) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const response = await axios.get(`${process.env.FHIR_BASE}/Coverage?patient=${patientId}`, { headers });
  
  return response.data.entry?.map((entry: any) => ({
    id: entry.resource.id,
    status: entry.resource.status,
    type: entry.resource.type?.text,
    subscriber: entry.resource.subscriber?.display,
    beneficiary: entry.resource.beneficiary?.display,
    relationship: entry.resource.relationship?.text,
    period: {
      start: entry.resource.period?.start,
      end: entry.resource.period?.end
    },
    payor: entry.resource.payor?.map((p: any) => p.display),
    class: entry.resource.class?.map((c: any) => ({
      type: c.type?.text,
      value: c.value,
      name: c.name
    }))
  })) || [];
}

export async function getExplanationOfBenefits(token: string, patientId: string) {
  console.log('📋 Fetching ExplanationOfBenefits for patientId:', patientId);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(`${process.env.FHIR_BASE}/ExplanationOfBenefit?patient=${patientId}`, { headers });
    console.log('📋 EOB API Response status:', response.status);
    console.log('📋 EOB API Response data keys:', Object.keys(response.data));
    console.log('📋 EOB entries count:', response.data.entry?.length || 0);
    console.log('📋 EOB total from API:', response.data.total);
    
    if (response.data.entry && response.data.entry.length > 0) {
      console.log('📋 All EOB entry IDs:', response.data.entry.map((entry: any) => entry.resource?.id || 'No ID'));
      console.log('📋 Sample EOB entry structure:', JSON.stringify(response.data.entry[0], null, 2));
    }
    
    // Filter out invalid entries and ensure we only process valid EOB resources
    const validEntries = response.data.entry?.filter((entry: any) => 
      entry.resource && entry.resource.resourceType === 'ExplanationOfBenefit'
    ) || [];
    
    console.log('📋 Valid EOB entries count:', validEntries.length);
    
    // Remove duplicates based on resource ID
    const uniqueEntries = validEntries.filter((entry: any, index: number, self: any[]) => 
      index === self.findIndex((e: any) => e.resource.id === entry.resource.id)
    );
    
    console.log('📋 Unique EOB entries count:', uniqueEntries.length);
    
    return uniqueEntries.map((entry: any) => ({
    id: entry.resource.id || entry.resource.identifier?.[0]?.value || 'Unknown',
    status: entry.resource.status,
    type: entry.resource.type?.text,
    use: entry.resource.use,
    patient: entry.resource.patient?.display,
    billablePeriod: {
      start: entry.resource.billablePeriod?.start,
      end: entry.resource.billablePeriod?.end
    },
    created: entry.resource.created,
    insurer: entry.resource.insurer?.display,
    provider: entry.resource.provider?.display,
    facility: entry.resource.facility?.display,
    supportingInfo: entry.resource.supportingInfo?.map((info: any) => ({
      sequence: info.sequence,
      category: info.category?.text,
      code: info.code?.text,
      value: info.valueString || info.valueQuantity?.value
    })),
    diagnosis: entry.resource.diagnosis?.map((diag: any) => ({
      sequence: diag.sequence,
      diagnosisCodeableConcept: diag.diagnosisCodeableConcept?.text,
      type: diag.type?.map((t: any) => t.text)
    })),
    procedure: entry.resource.procedure?.map((proc: any) => ({
      sequence: proc.sequence,
      date: proc.date,
      procedureCodeableConcept: proc.procedureCodeableConcept?.text
    })),
    precedence: entry.resource.precedence,
    insurance: entry.resource.insurance?.map((ins: any) => ({
      focal: ins.focal,
      coverage: ins.coverage?.display,
      preAuthRef: ins.preAuthRef
    })),
    item: entry.resource.item?.map((item: any) => ({
      sequence: item.sequence,
      careTeamSequence: item.careTeamSequence,
      diagnosisSequence: item.diagnosisSequence,
      procedureSequence: item.procedureSequence,
      informationSequence: item.informationSequence,
      revenue: item.revenue?.text,
      category: item.category?.text,
      productOrService: item.productOrService?.text,
      modifier: item.modifier?.map((m: any) => m.text),
      programCode: item.programCode?.map((p: any) => p.text),
      servicedDate: item.servicedDate,
      servicedPeriod: item.servicedPeriod,
      locationCodeableConcept: item.locationCodeableConcept?.text,
      locationAddress: item.locationAddress,
      locationReference: item.locationReference?.display,
      quantity: item.quantity?.value,
      unitPrice: item.unitPrice?.value,
      factor: item.factor,
      net: item.net?.value,
      udi: item.udi?.map((u: any) => u.display),
      bodySite: item.bodySite?.text,
      subSite: item.subSite?.map((s: any) => s.text),
      encounter: item.encounter?.map((e: any) => e.display),
      noteNumber: item.noteNumber,
      adjudication: item.adjudication?.map((adj: any) => ({
        category: adj.category?.text,
        reason: adj.reason?.text,
        amount: adj.amount?.value,
        value: adj.value
      })),
      detail: item.detail?.map((detail: any) => ({
        sequence: detail.sequence,
        revenue: detail.revenue?.text,
        category: detail.category?.text,
        productOrService: detail.productOrService?.text,
        modifier: detail.modifier?.map((m: any) => m.text),
        quantity: detail.quantity?.value,
        unitPrice: detail.unitPrice?.value,
        factor: detail.factor,
        net: detail.net?.value,
        udi: detail.udi?.map((u: any) => u.display),
        noteNumber: detail.noteNumber,
        adjudication: detail.adjudication?.map((adj: any) => ({
          category: adj.category?.text,
          reason: adj.reason?.text,
          amount: adj.amount?.value,
          value: adj.value
        }))
      }))
    })),
    addItem: entry.resource.addItem?.map((addItem: any) => ({
      itemSequence: addItem.itemSequence,
      detailSequence: addItem.detailSequence,
      subDetailSequence: addItem.subDetailSequence,
      provider: addItem.provider?.map((p: any) => p.display),
      productOrService: addItem.productOrService?.text,
      modifier: addItem.modifier?.map((m: any) => m.text),
      programCode: addItem.programCode?.map((p: any) => p.text),
      servicedDate: addItem.servicedDate,
      servicedPeriod: addItem.servicedPeriod,
      locationCodeableConcept: addItem.locationCodeableConcept?.text,
      locationAddress: addItem.locationAddress,
      locationReference: addItem.locationReference?.display,
      quantity: addItem.quantity?.value,
      unitPrice: addItem.unitPrice?.value,
      factor: addItem.factor,
      net: addItem.net?.value,
      bodySite: addItem.bodySite?.text,
      subSite: addItem.subSite?.map((s: any) => s.text),
      noteNumber: addItem.noteNumber,
      adjudication: addItem.adjudication?.map((adj: any) => ({
        category: adj.category?.text,
        reason: adj.reason?.text,
        amount: adj.amount?.value,
        value: adj.value
      })),
      detail: addItem.detail?.map((detail: any) => ({
        productOrService: detail.productOrService?.text,
        modifier: detail.modifier?.map((m: any) => m.text),
        quantity: detail.quantity?.value,
        unitPrice: detail.unitPrice?.value,
        factor: detail.factor,
        net: detail.net?.value,
        noteNumber: detail.noteNumber,
        adjudication: detail.adjudication?.map((adj: any) => ({
          category: adj.category?.text,
          reason: adj.reason?.text,
          amount: adj.amount?.value,
          value: adj.value
        }))
      }))
    })),
    total: entry.resource.total?.map((total: any) => ({
      category: total.category?.text,
      amount: total.amount?.value,
      currency: total.amount?.currency
    })),
    payment: entry.resource.payment ? {
      type: entry.resource.payment.type?.text,
      adjustment: entry.resource.payment.adjustment?.text,
      adjustmentReason: entry.resource.payment.adjustmentReason?.text,
      date: entry.resource.payment.date,
      amount: entry.resource.payment.amount?.value,
      identifier: entry.resource.payment.identifier?.value
    } : null,
    formCode: entry.resource.formCode?.text,
    form: entry.resource.form?.text,
    processNote: entry.resource.processNote?.map((note: any) => ({
      number: note.number,
      type: note.type,
      text: note.text,
      language: note.language?.text
    })),
    benefitBalance: entry.resource.benefitBalance?.map((balance: any) => ({
      category: balance.category?.text,
      excluded: balance.excluded,
      name: balance.name,
      description: balance.description,
      network: balance.network?.text,
      unit: balance.unit?.text,
      term: balance.term?.text,
      financial: balance.financial?.map((fin: any) => ({
        type: fin.type?.text,
        allowedUnsignedInt: fin.allowedUnsignedInt,
        allowedString: fin.allowedString,
        allowedMoney: fin.allowedMoney?.value,
        usedMoney: fin.usedMoney?.value
      }))
    }))
  })) || [];
  } catch (error) {
    console.error('❌ Error fetching ExplanationOfBenefits:', error);
    throw error;
  }
}

export async function getSpecificEOB(token: string, eobId: string) {
  const headers = { Authorization: `Bearer ${token}` };
  
  const response = await axios.get(`${process.env.FHIR_BASE}/ExplanationOfBenefit/${eobId}`, { headers });
  
  return response.data;
}

export async function getPatientFundingSummary(token: string, patientId: string) {
  console.log('🔍 Starting getPatientFundingSummary for patientId:', patientId);
  
  try {
    // Get patient details, coverage, and EOBs in parallel
    console.log('📡 Fetching patient details, coverage, and EOBs...');
    const [patientDetails, coverage, eobs] = await Promise.all([
      getPatientDetails(token, patientId),
      getPatientCoverage(token, patientId),
      getExplanationOfBenefits(token, patientId)
    ]);
    
    console.log('✅ Data fetched successfully:');
    console.log('  - Patient details:', patientDetails ? '✅' : '❌');
    console.log('  - Coverage count:', coverage?.length || 0);
    console.log('  - EOBs count:', eobs?.length || 0);
    console.log('  - EOBs IDs:', eobs?.map((eob: any) => eob.id) || []);
    
    // Calculate funding summary from EOBs
    const fundingSummary = {
      totalBilled: 0,
      totalCovered: 0,
      totalPatientResponsibility: 0,
      totalCopay: 0,
      totalDeductible: 0,
      remainingBalance: 0,
      claimCount: eobs?.length || 0
    };
    
    console.log('💰 Processing EOBs for funding calculations...');
    
    if (eobs && eobs.length > 0) {
      eobs.forEach((eob: any, index: number) => {
        console.log(`  📋 Processing EOB ${index + 1}/${eobs.length}:`, eob.id);
        console.log(`    - Status: ${eob.status}`);
        console.log(`    - Items count: ${eob.item?.length || 0}`);
        
        // Calculate totals from EOB items
        if (eob.item && eob.item.length > 0) {
          eob.item.forEach((item: any, itemIndex: number) => {
            console.log(`    - Item ${itemIndex + 1}: ${item.productOrService || 'Unknown service'}`);
            
            const billedAmount = item.net?.value || 0;
            console.log(`      - Billed amount: $${billedAmount}`);
            
            // Log adjudication details
            if (item.adjudication && item.adjudication.length > 0) {
              console.log(`      - Adjudications:`, item.adjudication.map((adj: any) => ({
                category: adj.category?.text,
                amount: adj.amount?.value,
                reason: adj.reason?.text
              })));
            } else {
              console.log(`      - No adjudications found`);
            }
            
            const coveredAmount = item.adjudication?.reduce((sum: number, adj: any) => {
              if (adj.category?.text === 'benefit') {
                console.log(`        + Adding benefit: $${adj.amount?.value || 0}`);
                return sum + (adj.amount?.value || 0);
              }
              return sum;
            }, 0) || 0;
            
            const patientResponsibility = item.adjudication?.reduce((sum: number, adj: any) => {
              if (adj.category?.text === 'patient') {
                console.log(`        + Adding patient responsibility: $${adj.amount?.value || 0}`);
                return sum + (adj.amount?.value || 0);
              }
              return sum;
            }, 0) || 0;
            
            const copayAmount = item.adjudication?.reduce((sum: number, adj: any) => {
              if (adj.category?.text === 'copay') {
                console.log(`        + Adding copay: $${adj.amount?.value || 0}`);
                return sum + (adj.amount?.value || 0);
              }
              return sum;
            }, 0) || 0;
            
            const deductibleAmount = item.adjudication?.reduce((sum: number, adj: any) => {
              if (adj.category?.text === 'deductible') {
                console.log(`        + Adding deductible: $${adj.amount?.value || 0}`);
                return sum + (adj.amount?.value || 0);
              }
              return sum;
            }, 0) || 0;
            
            console.log(`      - Calculated amounts:`);
            console.log(`        * Covered: $${coveredAmount}`);
            console.log(`        * Patient responsibility: $${patientResponsibility}`);
            console.log(`        * Copay: $${copayAmount}`);
            console.log(`        * Deductible: $${deductibleAmount}`);
            
            fundingSummary.totalBilled += billedAmount;
            fundingSummary.totalCovered += coveredAmount;
            fundingSummary.totalPatientResponsibility += patientResponsibility;
            fundingSummary.totalCopay += copayAmount;
            fundingSummary.totalDeductible += deductibleAmount;
          });
        } else {
          console.log(`    - No items found in EOB`);
        }
      });
    } else {
      console.log('⚠️  No EOBs found for this patient');
    }
    
    fundingSummary.remainingBalance = fundingSummary.totalPatientResponsibility - fundingSummary.totalCopay - fundingSummary.totalDeductible;
    
    console.log('💰 Final funding summary:');
    console.log('  - Total Billed: $', fundingSummary.totalBilled);
    console.log('  - Total Covered: $', fundingSummary.totalCovered);
    console.log('  - Patient Responsibility: $', fundingSummary.totalPatientResponsibility);
    console.log('  - Copay: $', fundingSummary.totalCopay);
    console.log('  - Deductible: $', fundingSummary.totalDeductible);
    console.log('  - Remaining Balance: $', fundingSummary.remainingBalance);
    console.log('  - Claim Count: ', fundingSummary.claimCount);
    
    return {
      patient: patientDetails,
      coverage: coverage,
      eobs: eobs,
      fundingSummary: fundingSummary
    };
  } catch (error) {
    console.error('❌ Error in getPatientFundingSummary:', error);
    throw error;
  }
}

