# Epic FHIR APIs Implementation Roadmap
## Patient Funding & Payment Automation Application

This document outlines the step-by-step implementation plan for integrating additional Epic FHIR APIs into our Patient Funding & Payment Automation application.

---

## 🎯 **Current Status**
- ✅ **Patient** - Patient demographics and contact info
- ✅ **Coverage** - Insurance coverage and eligibility  
- ✅ **ExplanationOfBenefit** - Claims and payment details

---

## 🚀 **Phase 1: Core Financial APIs (High Priority)**

### **1. Claim API**
**Purpose:** Get original claim submissions and details
**Use Case:** Compare original claims with EOBs for discrepancies
**Implementation Steps:**
- [ ] Create `src/services/claimService.ts`
- [ ] Add `getPatientClaims()` function
- [ ] Add `getSpecificClaim()` function
- [ ] Create TypeScript interfaces in `src/types/fhir.ts`
- [ ] Add claim comparison logic in funding dashboard
- [ ] Update funding summary calculations

### **2. Invoice API**
**Purpose:** Access billing invoices and statements
**Use Case:** Show patient billing history and outstanding balances
**Implementation Steps:**
- [ ] Create `src/services/invoiceService.ts`
- [ ] Add `getPatientInvoices()` function
- [ ] Add `getInvoiceDetails()` function
- [ ] Create invoice display component in funding dashboard
- [ ] Add outstanding balance calculations

### **3. Account API**
**Purpose:** Patient account balances and billing accounts
**Use Case:** Show current account status and payment history
**Implementation Steps:**
- [ ] Create `src/services/accountService.ts`
- [ ] Add `getPatientAccounts()` function
- [ ] Add account balance tracking
- [ ] Integrate with funding summary

---

## 🏥 **Phase 2: Provider & Organization APIs (Medium Priority)**

### **4. Organization API**
**Purpose:** Healthcare organizations and facilities
**Use Case:** Show provider details and facility information
**Implementation Steps:**
- [ ] Create `src/services/organizationService.ts`
- [ ] Add `getOrganization()` function
- [ ] Add provider lookup functionality
- [ ] Display provider details in EOB modal

### **5. Practitioner API**
**Purpose:** Healthcare providers and staff
**Use Case:** Show provider information for claims
**Implementation Steps:**
- [ ] Create `src/services/practitionerService.ts`
- [ ] Add `getPractitioner()` function
- [ ] Add provider details to EOB display
- [ ] Link providers to claims and encounters

### **6. Encounter API**
**Purpose:** Patient visits and encounters
**Use Case:** Provide context for claims and billing
**Implementation Steps:**
- [ ] Create `src/services/encounterService.ts`
- [ ] Add `getPatientEncounters()` function
- [ ] Link encounters to claims
- [ ] Show visit context in funding dashboard

---

## 💰 **Phase 3: Advanced Financial APIs (Medium Priority)**

### **7. PaymentReconciliation API**
**Purpose:** Payment reconciliation records
**Use Case:** Track payment processing and reconciliation
**Implementation Steps:**
- [ ] Create `src/services/paymentReconciliationService.ts`
- [ ] Add `getPaymentReconciliations()` function
- [ ] Add payment tracking dashboard
- [ ] Show payment status and history

### **8. PaymentNotice API**
**Purpose:** Payment notifications and confirmations
**Use Case:** Real-time payment status updates
**Implementation Steps:**
- [ ] Create `src/services/paymentNoticeService.ts`
- [ ] Add `getPaymentNotices()` function
- [ ] Add payment notification system
- [ ] Real-time payment status updates

### **9. ChargeItem API**
**Purpose:** Individual chargeable items
**Use Case:** Detailed billing breakdown
**Implementation Steps:**
- [ ] Create `src/services/chargeItemService.ts`
- [ ] Add `getChargeItems()` function
- [ ] Add detailed billing breakdown
- [ ] Show itemized charges

---

## 📋 **Phase 4: Clinical Context APIs (Low Priority)**

### **10. Procedure API**
**Purpose:** Medical procedures performed
**Use Case:** Clinical context for billing
**Implementation Steps:**
- [ ] Create `src/services/procedureService.ts`
- [ ] Add `getPatientProcedures()` function
- [ ] Link procedures to claims
- [ ] Show clinical context

### **11. DiagnosticReport API**
**Purpose:** Lab results and diagnostic reports
**Use Case:** Clinical documentation for claims
**Implementation Steps:**
- [ ] Create `src/services/diagnosticReportService.ts`
- [ ] Add `getDiagnosticReports()` function
- [ ] Add clinical documentation
- [ ] Link reports to claims

### **12. Observation API**
**Purpose:** Clinical measurements and findings
**Use Case:** Clinical data for claim validation
**Implementation Steps:**
- [ ] Create `src/services/observationService.ts`
- [ ] Add `getObservations()` function
- [ ] Add clinical data integration
- [ ] Validate claims against clinical data

---

## 🛠️ **Implementation Guidelines**

### **For Each New API:**

1. **Create Service File:**
   ```typescript
   // src/services/newApiService.ts
   import axios from 'axios';
   import { NewApiType } from '../types/fhir.js';
   import { logger } from '../utils/logger.js';
   
   export async function getNewApiData(token: string, patientId: string): Promise<NewApiType[]> {
     logger.info('Fetching new API data for patient:', patientId);
     // Implementation here
   }
   ```

2. **Add TypeScript Interfaces:**
   ```typescript
   // src/types/fhir.ts
   export interface NewApiType {
     id: string;
     // Add relevant properties
   }
   ```

3. **Update Funding Service:**
   ```typescript
   // src/services/fundingService.ts
   import { getNewApiData } from './newApiService.js';
   
   // Add to getPatientFundingSummary function
   ```

4. **Add Route Handler:**
   ```typescript
   // src/routes/funding.ts
   router.get('/api/new-api', async (req, res) => {
     // Implementation here
   });
   ```

5. **Update Frontend:**
   ```javascript
   // src/views/funding.ejs
   // Add UI components and JavaScript functions
   ```

---

## 📊 **Priority Matrix**

| API | Business Value | Implementation Effort | Priority |
|-----|---------------|---------------------|----------|
| Claim | High | Medium | 1 |
| Invoice | High | Medium | 2 |
| Account | High | Low | 3 |
| Organization | Medium | Low | 4 |
| Practitioner | Medium | Low | 5 |
| Encounter | Medium | Medium | 6 |
| PaymentReconciliation | High | High | 7 |
| PaymentNotice | Medium | Medium | 8 |
| ChargeItem | Medium | Medium | 9 |
| Procedure | Low | Medium | 10 |
| DiagnosticReport | Low | High | 11 |
| Observation | Low | High | 12 |

---

## 🎯 **Success Metrics**

### **Phase 1 Goals:**
- [ ] Complete claim vs EOB comparison
- [ ] Show outstanding balances
- [ ] Display billing history
- [ ] Improve funding calculations

### **Phase 2 Goals:**
- [ ] Enhanced provider information
- [ ] Better claim context
- [ ] Improved user experience

### **Phase 3 Goals:**
- [ ] Real-time payment tracking
- [ ] Payment reconciliation
- [ ] Detailed billing breakdown

### **Phase 4 Goals:**
- [ ] Clinical context integration
- [ ] Comprehensive patient view
- [ ] Advanced analytics

---

## 🔧 **Technical Considerations**

### **Performance:**
- Implement caching for frequently accessed data
- Use parallel API calls where possible
- Add pagination for large datasets

### **Error Handling:**
- Graceful degradation when APIs are unavailable
- Retry logic for failed requests
- User-friendly error messages

### **Security:**
- Validate all API responses
- Sanitize data before display
- Log security-relevant events

### **Testing:**
- Unit tests for each service
- Integration tests for API calls
- End-to-end testing for user flows

---

## 📝 **Documentation Updates**

After implementing each API:
- [ ] Update README.md with new features
- [ ] Add API documentation
- [ ] Update user guides
- [ ] Document any configuration changes

---

## 🚀 **Getting Started**

1. **Choose an API from Phase 1**
2. **Follow the implementation guidelines**
3. **Test thoroughly with Epic sandbox**
4. **Update this roadmap with progress**
5. **Move to next API in priority order**

---

*Last Updated: [Current Date]*
*Next Review: [Date + 1 week]*
