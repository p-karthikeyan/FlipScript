// Shared admin password verification used by all /api/admin/* routes.
// The password is stored only in server-side env (ADMIN_PASSWORD) and is
// never exposed to the client. Every admin route must call this before
// touching any data.
export function verifyAdminPassword(req: Request): boolean {
  const header = req.headers.get('x-admin-password') ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';

  // Reject if the env var is not configured — fail closed, not open.
  if (!adminPassword) return false;

  // Constant-time comparison to prevent timing attacks.
  if (header.length !== adminPassword.length) return false;
  let mismatch = 0;
  for (let i = 0; i < header.length; i++) {
    mismatch |= header.charCodeAt(i) ^ adminPassword.charCodeAt(i);
  }
  return mismatch === 0;
}
