import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mabdc.galanight',
  appName: 'Gala Night',
  webDir: 'out',
  server: {
    url: 'https://galanight-production.up.railway.app',
    cleartext: true
  }
};

export default config;
