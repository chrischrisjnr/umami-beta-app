import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.umami.app',
  appName: 'umami',
  webDir: 'build',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'umami',
    backgroundColor: '#ffffff'
  },
  server: {
    iosScheme: 'https'
  }
};

export default config;
