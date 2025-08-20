# Epic FHIR Clinicians/Administrative Users Integration

This project is a Node.js/TypeScript backend service that integrates with Epic's FHIR API using OAuth2 authentication. It enables clinicians or administrative users to securely access patient data from Epic via FHIR endpoints.

## Features

- **OAuth2 Authorization Code Flow** with Epic
- **Patient Search** by name
- **Patient Summary**: demographics, conditions, medications, allergies
- **Session Management** for storing tokens and patient context
- **Modular Express Routing** for launch, callback, patient, summary, and dashboard

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

1. **Launch Authentication:**
   - Visit `/launch` to start Epic OAuth2 login.

2. **Callback Handling:**
   - After Epic login, you’ll be redirected to `/callback` where the token is exchanged and stored in session.

3. **Patient Search:**
   - Use `/patient?given=John&family=Smith&token=<access_token>` to search for a patient.

4. **Dashboard:**
   - After selecting a patient, visit `/dashboard` to view the patient summary.

### Project Structure

- `src/index.ts` - Main Express app
- `src/routes/launch.ts` - OAuth2 launch endpoint
- `src/routes/callback.ts` - OAuth2 callback handler
- `src/routes/patient.ts` - Patient search endpoint
- `src/routes/summary.ts` - Patient summary endpoint
- `src/routes/dashboard.ts` - Dashboard endpoint
- `src/services/epicService.ts` - Epic FHIR API integration

### Notes

- Use [ngrok](https://ngrok.com/) for public HTTPS endpoints during development.
- Ensure session middleware is configured for authentication context.
- Update environment variables for your Epic sandbox.

## License

MIT