import '@testing-library/jest-dom';

// Mock import.meta.env for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY: 'test-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456',
    VITE_FIREBASE_APP_ID: '1:123456:web:abc',
    VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST',
    VITE_AZURE_ENDPOINT: 'https://test.cognitiveservices.azure.com/',
    VITE_AZURE_DEPLOYMENT: 'gpt-test'
  }
});
