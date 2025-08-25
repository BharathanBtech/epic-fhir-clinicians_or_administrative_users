import { FHIRCodeableConcept, FHIRReference, FHIRMoney } from '../types/fhir.js';

/**
 * Safely extract text from FHIR CodeableConcept objects
 */
export function getTextFromFHIR(obj: any): string {
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

/**
 * Extract display text from FHIR CodeableConcept
 */
export function getCodeableConceptDisplay(concept: FHIRCodeableConcept): string {
  if (!concept) return 'N/A';
  if (concept.text) return concept.text;
  if (concept.coding && concept.coding.length > 0) {
    return concept.coding[0].display || concept.coding[0].code || 'N/A';
  }
  return 'N/A';
}

/**
 * Extract reference display text
 */
export function getReferenceDisplay(reference: FHIRReference): string {
  if (!reference) return 'N/A';
  return reference.display || reference.reference || 'N/A';
}

/**
 * Extract money value from FHIR Money object
 */
export function getMoneyValue(money: any): number {
  console.log('💰 getMoneyValue input:', money);
  
  if (!money) {
    console.log('💰 getMoneyValue: No money object provided');
    return 0;
  }
  
  // Try different possible properties where the amount might be stored
  if (typeof money === 'number') {
    console.log('💰 getMoneyValue: Direct number value:', money);
    return money;
  }
  
  if (money.value !== undefined) {
    console.log('💰 getMoneyValue: Found money.value:', money.value);
    return money.value;
  }
  
  if (money.amount !== undefined) {
    console.log('💰 getMoneyValue: Found money.amount:', money.amount);
    return money.amount;
  }
  
  if (money.total !== undefined) {
    console.log('💰 getMoneyValue: Found money.total:', money.total);
    return money.total;
  }
  
  // If it's a string, try to parse it
  if (typeof money === 'string') {
    const parsed = parseFloat(money);
    console.log('💰 getMoneyValue: Parsed string value:', parsed);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Log the full object structure for debugging
  console.log('💰 getMoneyValue: Could not extract value from:', JSON.stringify(money, null, 2));
  return 0;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate patient responsibility from EOB item adjudications
 */
export function calculatePatientResponsibility(adjudications: any[]): number {
  if (!adjudications || adjudications.length === 0) return 0;
  
  return adjudications.reduce((sum, adj) => {
    const categoryText = getTextFromFHIR(adj.category);
    if (categoryText.toLowerCase().includes('patient') || 
        categoryText.toLowerCase().includes('responsibility') ||
        categoryText.toLowerCase().includes('deductible') ||
        categoryText.toLowerCase().includes('copay')) {
      return sum + (adj.amount?.value || adj.amount || 0);
    }
    return sum;
  }, 0);
}

/**
 * Calculate covered amount from EOB item adjudications
 */
export function calculateCoveredAmount(adjudications: any[]): number {
  if (!adjudications || adjudications.length === 0) return 0;
  
  return adjudications.reduce((sum, adj) => {
    const categoryText = getTextFromFHIR(adj.category);
    if (categoryText.toLowerCase().includes('benefit')) {
      return sum + (adj.amount?.value || adj.amount || 0);
    }
    return sum;
  }, 0);
}

/**
 * Format service dates from EOB item
 */
export function formatServiceDates(item: any): { startDate: string; endDate: string } {
  let startDate = 'N/A';
  let endDate = 'N/A';
  
  if (item.servicedPeriodStart) {
    startDate = item.servicedPeriodStart;
  } else if (item.servicedPeriod?.start) {
    startDate = item.servicedPeriod.start;
  } else if (item.servicedDate) {
    startDate = item.servicedDate;
  }
  
  if (item.servicedPeriodEnd) {
    endDate = item.servicedPeriodEnd;
  } else if (item.servicedPeriod?.end) {
    endDate = item.servicedPeriod.end;
  } else if (item.servicedDate) {
    endDate = item.servicedDate;
  }
  
  return { startDate, endDate };
}

/**
 * Calculate total amount from EOB totals
 */
export function calculateTotalAmount(totals: any[]): number {
  if (!totals || totals.length === 0) return 0;
  
  // Try to find benefit amount first
  const benefitTotal = totals.find(t => {
    const categoryText = getTextFromFHIR(t.category);
    return categoryText.toLowerCase().includes('benefit');
  });
  
  if (benefitTotal) {
    return getMoneyValue(benefitTotal.amount);
  }
  
  // If no benefit found, sum all amounts
  return totals.reduce((sum, t) => {
    return sum + getMoneyValue(t.amount);
  }, 0);
}
