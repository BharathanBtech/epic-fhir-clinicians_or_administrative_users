# Epic FHIR Patient Funding & Payment Automation

A modern, modular Node.js/TypeScript application that integrates with Epic's FHIR APIs to automate patient funding and payment processes. This application serves as a bridge between Epic (FHIR APIs) and internal funding applications, providing real-time patient, insurance, and claim information.

## 🏗️ Architecture Overview

The application follows a **modular, service-oriented architecture** with clear separation of concerns:

```
src/
├── config/           # Configuration management
├── middleware/       # Express middleware
├── routes/          # Route handlers
├── services/        # Business logic services
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
└── views/           # EJS templates
```

## 🚀 Key Features

- **Patient Search & Selection**: Epic FHIR launch integration with patient context
- **Real-time Data Retrieval**: Patient demographics, insurance coverage, and EOBs
- **Funding Dashboard**: Comprehensive patient funding summary and calculations
- **EOB Management**: Detailed Explanation of Benefits viewing with line-item breakdown
- **Modular Architecture**: Clean, maintainable codebase with focused modules
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Centralized error management and logging
- **Configuration Management**: Environment-based configuration system

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Epic FHIR API access credentials
- Valid Epic OAuth2 application registration

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd epic-fhir-clinicians_or_administrative_users
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Epic FHIR Configuration
   FHIR_BASE=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
   CLIENT_ID=your_epic_client_id
   CLIENT_SECRET=your_epic_client_secret
   REDIRECT_URI=http://localhost:4000/callback
   TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
   AUTH_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
   
   # Application Configuration
   PORT=4000
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## 🏃‍♂️ Usage Flow

### 1. Patient Search
- Navigate to `http://localhost:4000`
- Click "Search Patient" to initiate Epic FHIR launch
- Select a patient in Epic's interface
- Return to application with patient context

### 2. Funding Dashboard
- View patient demographics and insurance information
- See comprehensive funding summary with calculations
- Access Explanation of Benefits (EOB) list
- Use refresh icons to update specific components

### 3. EOB Details
- Click "View EOB" on any claim to see detailed breakdown
- Review service dates, amounts, and adjudications
- Analyze patient responsibility and coverage details

## 🏗️ Project Structure

### Core Modules

#### **Configuration (`src/config/`)**
- `index.ts` - Centralized configuration management
- Environment variable validation
- Feature flags and application settings

#### **Services (`src/services/`)**
- `patientService.ts` - Patient data operations
- `coverageService.ts` - Insurance coverage management
- `eobService.ts` - Explanation of Benefits processing
- `fundingService.ts` - Funding calculations and summaries
- `authService.ts` - OAuth2 authentication handling
- `epicService.ts` - Legacy compatibility layer

#### **Types (`src/types/`)**
- `fhir.ts` - Comprehensive FHIR resource interfaces
- Type-safe data structures for all FHIR resources
- Application-specific type definitions

#### **Utilities (`src/utils/`)**
- `fhirHelpers.ts` - FHIR data processing utilities
- `logger.ts` - Centralized logging service
- `state.ts` - OAuth2 state management

#### **Middleware (`src/middleware/`)**
- `auth.ts` - Authentication and session validation
- `errorHandler.ts` - Error handling and logging

#### **Routes (`src/routes/`)**
- `patient-search.ts` - Patient search landing page
- `launch.ts` - Epic FHIR launch initiation
- `callback.ts` - OAuth2 callback handling
- `funding.ts` - Funding dashboard and EOB management
- Legacy routes for backward compatibility

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run clean    # Clean build artifacts
```

### Code Organization Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Services are loosely coupled
3. **Type Safety**: Comprehensive TypeScript interfaces
4. **Error Handling**: Centralized error management
5. **Logging**: Structured logging throughout the application
6. **Configuration**: Environment-based configuration management

### Adding New Features

1. **Create TypeScript interfaces** in `src/types/`
2. **Implement business logic** in `src/services/`
3. **Add route handlers** in `src/routes/`
4. **Create views** in `src/views/`
5. **Update configuration** in `src/config/` if needed

## 🔍 API Endpoints

### Patient Management
- `GET /patient-search` - Patient search landing page
- `GET /patient-search/launch` - Initiate Epic FHIR launch
- `GET /callback` - OAuth2 callback handler

### Funding Dashboard
- `GET /funding` - Main funding dashboard
- `GET /funding/eob/:eobId` - Get specific EOB details
- `GET /funding/api/summary` - AJAX funding summary
- `GET /funding/api/insurance` - AJAX insurance refresh
- `GET /funding/api/eob` - AJAX EOB refresh

### Legacy Endpoints
- `GET /patient` - Patient search by name
- `GET /summary` - Patient summary data
- `GET /dashboard` - Legacy dashboard

## 🛡️ Security

- **OAuth2 Authorization Code Flow** with Epic
- **Session-based authentication** with secure cookies
- **Environment variable protection** for sensitive data
- **Input validation** and sanitization
- **Error message sanitization** in production

## 📊 Logging

The application uses a centralized logging system with different levels:

- **ERROR**: Application errors and failures
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information (development only)

Logs include structured data for better analysis and monitoring.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
SESSION_SECRET=strong_random_secret
# ... other Epic FHIR credentials
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

## 🔮 Future Enhancements

- **Automated Payments**: Direct payment processing from EOB screen
- **Payment Gateway Integration**: Stripe, PayPal, or other payment processors
- **Audit Logging**: Comprehensive audit trails for compliance
- **Role-Based Access Control**: Patient, provider, and finance team roles
- **Real-time Notifications**: WebSocket-based updates
- **Mobile Support**: Progressive Web App (PWA) features
- **Advanced Analytics**: Funding trends and reporting
- **Bulk Operations**: Batch processing for multiple patients

## 🤝 Contributing

1. Follow the modular architecture principles
2. Add comprehensive TypeScript interfaces
3. Include proper error handling and logging
4. Write clear documentation for new features
5. Test thoroughly with Epic FHIR sandbox

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the logging output for detailed error information
2. Verify Epic FHIR API credentials and permissions
3. Ensure all environment variables are properly configured
4. Review the modular architecture documentation

---

**Built with ❤️ for healthcare interoperability and patient care automation**