import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ricmsd.pomodoro',
  appName: 'Pomodoro',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
