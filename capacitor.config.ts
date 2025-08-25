import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'MovilApp',
  webDir: 'build', // carpeta del build de React
  server: {
    cleartext: true,
     androidScheme: 'http'// permite HTTP para tus fetch al backend
  }
};


export default config;
