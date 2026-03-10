import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitnova.app',
  appName: 'FitNova',
  webDir: 'dist',
  server: {
    url: 'https://126f3cf9-0ea4-418b-aa97-63b562c1f190.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
