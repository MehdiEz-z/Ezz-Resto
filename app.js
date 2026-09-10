import { initAuth } from './shared/auth.js';
import { activate, resetModule } from './admin/boot.js';

initAuth({
  onAuthenticated: async () => {
    await activate();
  },
  onSignedOut: async () => {
    resetModule();
  },
});
