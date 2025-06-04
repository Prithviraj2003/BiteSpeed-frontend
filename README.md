# Bitespeed Identity Reconciliation Dashboard

This React application provides a visual dashboard for Bitespeed's identity reconciliation system, allowing you to view and test contact consolidation according to the PRD requirements.

## Features

### ✅ PRD-Compliant Contact Visualization

- **Consolidated Contact Data**: Primary contacts display all linked emails and phone numbers
- **Primary Data Priority**: Primary contact's email and phone number appear first in lists
- **Duplicate Elimination**: Automatically removes duplicate emails and phone numbers while preserving order
- **Visual Indicators**: Clear badges show when data is consolidated from multiple contacts
- **Linked Contact Graph**: Visual connections between primary and secondary contacts

### 🎯 Key PRD Alignments

1. **Primary Contact Emphasis**: First email and phone number are always from the primary contact
2. **Consolidated Display**: All related emails and phone numbers shown together
3. **Proper Deduplication**: Unique values only, with primary contact data prioritized
4. **Visual Hierarchy**: Primary contacts prominently displayed with consolidated data badges

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contact Data Structure

The application visualizes contact data according to the Bitespeed PRD:

```typescript
// Primary contacts show consolidated data
{
  primaryContactId: string,
  emails: string[],        // Primary contact's email appears first
  phoneNumbers: string[],  // Primary contact's phone appears first
  secondaryContactIds: string[]
}
```

## Visual Elements

- **Primary Contacts** (👑): Show consolidated data with golden crown icon
- **Secondary Contacts** (👤): Individual contact information
- **Consolidated Badge**: Appears when primary contact has multiple linked contacts
- **Primary Data Highlight**: First email/phone highlighted in primary contacts
- **Connection Lines**: Visual links between primary and secondary contacts

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
