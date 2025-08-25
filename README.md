# Epic FHIR Patient Funding & Payment Automation

This project is a Node.js/TypeScript backend service that integrates with Epic's FHIR API using OAuth2 authentication. It enables clinicians or administrative users to securely access patient data, insurance information, and payment details from Epic via FHIR endpoints for automated funding and payment processing.

## Features

- **OAuth2 Authorization Code Flow** with Epic
- **Patient Search** through Epic's secure interface
- **Patient Funding Dashboard** with real-time financial data
- **Insurance Coverage** information and eligibility
- **Explanation of Benefits (EOB)** access and detailed breakdown
- **Payment Automation** calculations and summaries
- **Session Management** for storing tokens and patient context
- **Modular Express Routing** for comprehensive FHIR integration

## New Funding & Payment Features

### Patient Funding Screen
- **Patient Demographics**: Name, MRN, DOB, contact information
- **Insurance Details**: Coverage status, payor information, effective dates
- **Funding Summary**: Total billed, covered amounts, patient responsibility
- **Financial Breakdown**: Copay, deductible, remaining balance calculations

### EOB (Explanation of Benefits) Access
- **High-level Claim Info**: Claim ID, status, service dates, provider details
- **Financial Information**: Billed amounts, insurance coverage, patient responsibility
- **Line Item Breakdown**: Service descriptions, CPT/HCPCS codes, allowed vs billed amounts
- **Interactive Modal**: Detailed EOB view with comprehensive claim information

### FHIR APIs Integrated
- **Patient**: Demographics and contact information
- **Coverage**: Insurance details and eligibility
- **ExplanationOfBenefit**: Complete EOB data and financial breakdowns

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Epic FHIR sandbox credentials

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd epic-fhir-clinicians_or_administrative_users
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your Epic credentials and endpoints:
   ```
   CLIENT_ID=your_epic_client_id
   CLIENT_SECRET=your_epic_client_secret
   REDIRECT_URI=https://your-ngrok-url/callback
   AUTH_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
   TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
   FHIR_BASE=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
   SESSION_SECRET=your_session_secret
   PORT=4000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Usage

1. **Patient Search:**
   - Visit `/patient-search` to access the funding application
   - Click "Search Patient" to initiate Epic OAuth2 login
   - Select a patient through Epic's interface

2. **Funding Dashboard:**
   - After patient selection, you'll be redirected to `/funding`
   - View patient demographics, insurance coverage, and funding summary
   - Access detailed EOB information for each claim

3. **EOB Details:**
   - Click "View EOB" on any claim to see detailed breakdown
   - Review service items, financial calculations, and payment information
   - Export or download EOB data (future enhancement)

### Project Structure

- `src/index.ts` - Main Express app with all routes
- `src/routes/`
  - `launch.ts` - OAuth2 launch endpoint
  - `callback.ts` - OAuth2 callback handler
  - `patient-search.ts` - Patient search interface
  - `funding.ts` - Patient funding dashboard
  - `patient.ts` - Patient search endpoint
  - `summary.ts` - Patient summary endpoint
  - `dashboard.ts` - Legacy dashboard endpoint
- `src/services/epicService.ts` - Epic FHIR API integration
- `src/views/`
  - `patient-search.ejs` - Patient search landing page
  - `funding.ejs` - Patient funding dashboard
  - `dashboard.ejs` - Legacy patient summary view
- `src/utils/state.ts` - OAuth2 state generation

### FHIR Endpoints Used

- `GET /Patient/{id}` - Patient demographics
- `GET /Coverage?patient={id}` - Insurance coverage
- `GET /ExplanationOfBenefit?patient={id}` - EOB data
- `GET /ExplanationOfBenefit/{id}` - Specific EOB details

### User Flow

1. **Landing Page** (`/patient-search`) - Modern UI with search button
2. **Epic Launch** (`/patient-search/launch`) - OAuth2 authentication
3. **Patient Selection** - Epic's patient search interface
4. **Callback** (`/callback`) - Token exchange and patient context
5. **Funding Dashboard** (`/funding`) - Complete patient funding view
6. **EOB Details** - Modal popup with detailed claim information

## Future Enhancements

- **Payment Processing**: Direct payment integration with payment gateways
- **Automated Payments**: Trigger payments directly from EOB screen
- **Audit Logging**: Comprehensive audit trails for funding and payments
- **Role-based Access**: Different views for patients, providers, and finance teams
- **Export Features**: PDF/CSV download for EOB and funding data
- **Real-time Updates**: WebSocket integration for live data updates

## Security Features

- OAuth2 authorization code flow with Epic
- Session-based token storage
- State parameter for CSRF protection
- Secure token exchange
- HTTPS requirement for production

## Notes

- Use [ngrok](https://ngrok.com/) for public HTTPS endpoints during development
- Ensure session middleware is configured for authentication context
- Update environment variables for your Epic sandbox
- All patient data is retrieved in real-time from Epic's FHIR APIs
- No patient data is stored locally - all data is fetched on-demand

## License

MIT