// Zrok service integration

const ZROK_API = 'http://localhost:18080/api/v1';
const ADMIN_TOKEN = process.env.ZROK_ADMIN_TOKEN || 'ganesh-secret-admin-token-123456789';

// Note: Zrok API integration can be complex. For this MVP, we will mock the account creation
// if the actual Zrok API is not reachable, to ensure the dashboard works seamlessly.
export async function createZrokAccount(email: string): Promise<string> {
  try {
    // In a real production scenario, we would call the Zrok admin API to generate an invite
    // and extract the token. For this demo, we generate a dummy Zrok token.
    console.log(`[ZROK] Creating account for ${email}...`);
    return `zr_tkn_${Math.random().toString(36).substr(2, 9)}`;
  } catch (err) {
    console.error('Zrok API error:', err);
    throw new Error('Failed to create Zrok account');
  }
}

export async function getZrokShares(userToken: string) {
  // Returns dummy shares for UI demonstration
  return [
    {
      id: 'shr_1',
      publicUrl: 'https://app1.127.0.0.1.nip.io',
      localPort: 3000,
      protocol: 'public',
      status: 'active',
      chiselCommand: `zrok share public localhost:3000`
    }
  ];
}
