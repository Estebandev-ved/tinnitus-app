// Información de la app móvil (Android / Capacitor)
// Sincronizado con capacitor.config.json y android/app/build.gradle
export const APP_INFO = {
  appName: 'TinnitOff',
  appId: 'com.tinnitoff.app',
  versionName: '1.0',
  versionCode: 1,
  platform: 'Android (Capacitor)',
  webDir: 'dist',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  firebaseProject: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  permissions: [
    'INTERNET',
    'RECORD_AUDIO',
    'CAMERA',
    'MODIFY_AUDIO_SETTINGS',
    'VIBRATE',
    'POST_NOTIFICATIONS',
    'RECEIVE_BOOT_COMPLETED',
    'SCHEDULE_EXACT_ALARM'
  ]
};
