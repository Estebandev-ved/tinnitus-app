import { defineConfig } from 'vitest/config';

// Firestore security-rules tests. Run through the emulator: `npm run test:rules`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/firestore-rules/**/*.emulator.js'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
