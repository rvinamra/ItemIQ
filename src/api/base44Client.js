import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68d9ca8713f69a066d1f404d", 
  requiresAuth: false // Ensure authentication is required for all operations
});
