/**
 * After a user logs in with Google via Privy, call this to
 * create their Tapestry profile automatically.
 *
 * It checks if a profile already exists. If not, it creates one
 * using the Google name as the username.
 */
export async function createProfileAfterLogin(
  walletAddress: string,
  googleName?: string | null,
) {
  // 1. Check if profile already exists
  const res = await fetch(`/api/profiles?walletAddress=${walletAddress}`)
  const data = await res.json()

  if (data.profiles && data.profiles.length > 0) {
    // Already has a profile, nothing to do
    return data.profiles[0]
  }

  // 2. Make a username from the google name
  const username = makeUsername(googleName)

  // 3. Create the profile
  const formData = new FormData()
  formData.append('username', username)
  formData.append('ownerWalletAddress', walletAddress)

  const createRes = await fetch('/api/profiles/create', {
    method: 'POST',
    body: formData,
  })

  if (!createRes.ok) {
    // Username might be taken — try again with a random suffix
    const fallback = username + '_' + Math.random().toString(36).slice(2, 6)
    const retryData = new FormData()
    retryData.append('username', fallback)
    retryData.append('ownerWalletAddress', walletAddress)

    const retryRes = await fetch('/api/profiles/create', {
      method: 'POST',
      body: retryData,
    })

    if (!retryRes.ok) {
      console.error('Failed to create profile')
      return null
    }

    return await retryRes.json()
  }

  return await createRes.json()
}

/** Turn "John Doe" into "john_doe". Fallback to "user_xxxx" if empty. */
function makeUsername(name?: string | null): string {
  if (!name) return 'user_' + Math.random().toString(36).slice(2, 6)

  const clean = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)

  return clean || 'user_' + Math.random().toString(36).slice(2, 6)
}
