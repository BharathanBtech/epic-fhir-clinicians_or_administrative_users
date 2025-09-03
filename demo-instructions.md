# EOB Submission Demo Guide

## Quick Start Demo

### 1. Start the Application
```bash
npm run build
npm start
```

### 2. Navigate to the Application
- Open browser to `http://localhost:4000`
- You'll be redirected to `/patient-search`
- Complete the Epic FHIR launch process to select a patient
- Navigate to the funding dashboard

### 3. Test the New EOB Features

#### View Complete EOB Details:
1. **Locate EOB Section**: Scroll down to "Explanation of Benefits (EOB)" section
2. **Expand Details**: Click "Show Details" button on any EOB card
3. **View Line Items**: Line items will load and display in an expandable table
4. **Collapse Details**: Click "Show Details" again to hide the details

#### Submit EOB for Copay:
1. **Find Submit Button**: Look for "Submit for Copay" button on any EOB card
2. **Click Submit**: Click the button to submit the EOB
3. **Watch Status**: Status indicator will show "Submitting..." then "Submission successful!"
4. **Monitor Progress**: Status will automatically progress over time

### 4. What You'll See

#### EOB Cards Display:
- **Claim ID**: Unique identifier for each claim
- **Status**: Current claim status (active, inactive, etc.)
- **Type**: Type of service (Professional, Institutional, etc.)
- **Service Date**: When the service was provided
- **Provider**: Healthcare provider name
- **Total Amount**: Total billed amount

#### After Submission:
- **Status Indicator**: Green dot with pulsing animation
- **Status Text**: Shows current submission state
- **Button State**: Submit button becomes disabled
- **Real-time Updates**: Status changes automatically over time

### 5. Status Progression Timeline

| Time Since Submission | Status | Description |
|----------------------|---------|-------------|
| 0-1 hours | `claim_in_progress` | Initial submission |
| 1-4 hours | `claim_under_review` | Under review |
| 4-8 hours | `claim_approved` or `claim_rejected` | Decision made |
| 8+ hours | `claim_paid` or `claim_denied` | Final outcome |

### 6. Mobile Testing
- Resize browser window to test responsive design
- Verify EOB cards stack properly on small screens
- Check that buttons and text remain readable

### 7. API Endpoints to Test

#### Get Line Items:
```bash
curl "http://localhost:4000/funding/api/eob/{EOB_ID}/line-items"
```

#### Submit for Copay:
```bash
curl -X POST "http://localhost:4000/funding/api/eob/{EOB_ID}/submit-for-copay"
```

#### Check Status:
```bash
curl "http://localhost:4000/funding/api/eob/{EOB_ID}/submission-status"
```

### 8. Expected Behavior

#### Successful Submission:
- Button becomes disabled
- Status shows "Submitting..."
- After delay, shows "Submission successful!"
- Status automatically progresses over time

#### Error Handling:
- Network errors show appropriate error messages
- Button re-enables after errors
- User can retry submission

### 9. Troubleshooting

#### Common Issues:
1. **EOB Details Not Loading**: Check Epic FHIR API connectivity
2. **Submission Fails**: Verify session authentication
3. **Status Not Updating**: Check browser console for errors
4. **Mobile Layout Issues**: Verify responsive CSS is loading

#### Debug Information:
- Check browser console for detailed logs
- Verify network requests in browser dev tools
- Check server logs for backend errors

### 10. Next Steps

#### For Production:
1. Replace `simulateExternalAPICall()` with real API calls
2. Add proper authentication for external system
3. Implement real-time status updates
4. Add email/SMS notifications

#### For Testing:
1. Test with different EOB types
2. Verify error scenarios
3. Test concurrent submissions
4. Validate data transformation accuracy

---

**Note**: This demo uses simulated external API calls. In production, these would be replaced with actual HTTP requests to your external system.
