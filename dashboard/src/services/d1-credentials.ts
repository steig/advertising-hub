async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(
  secret: string,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  // Generate random salt and IV per encryption
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  // Prepend salt to ciphertext so we can recover it on decrypt
  const combined = new Uint8Array(salt.length + new Uint8Array(encrypted).length);
  combined.set(salt);
  combined.set(new Uint8Array(encrypted), salt.length);
  return {
    ciphertext: btoa(String.fromCharCode(...combined)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decrypt(
  secret: string,
  ciphertext: string,
  iv: string
): Promise<string> {
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  // Extract salt (first 16 bytes) and actual ciphertext
  const salt = combined.slice(0, 16);
  const ciphertextBytes = combined.slice(16);
  const key = await deriveKey(secret, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    ciphertextBytes
  );
  return new TextDecoder().decode(decrypted);
}

export async function getCredential(
  db: D1Database,
  encryptionKey: string,
  teamId: string,
  platform: string
): Promise<Record<string, string> | null> {
  const row = await db
    .prepare('SELECT encrypted_data, iv FROM credentials WHERE team_id = ? AND platform = ?')
    .bind(teamId, platform)
    .first<{ encrypted_data: string; iv: string }>();
  if (!row) return null;
  const decrypted = await decrypt(encryptionKey, row.encrypted_data, row.iv);
  return JSON.parse(decrypted);
}

export async function putCredential(
  db: D1Database,
  encryptionKey: string,
  teamId: string,
  platform: string,
  data: Record<string, string>
): Promise<void> {
  const { ciphertext, iv } = await encrypt(
    encryptionKey,
    JSON.stringify(data)
  );
  await db
    .prepare(
      "INSERT OR REPLACE INTO credentials (team_id, platform, encrypted_data, iv, updated_at) VALUES (?, ?, ?, ?, datetime('now'))"
    )
    .bind(teamId, platform, ciphertext, iv)
    .run();
}

export async function deleteCredential(
  db: D1Database,
  teamId: string,
  platform: string
): Promise<void> {
  await db
    .prepare('DELETE FROM credentials WHERE team_id = ? AND platform = ?')
    .bind(teamId, platform)
    .run();
}

export async function listCredentialStatus(
  db: D1Database,
  teamId: string
): Promise<
  Array<{ platform: string; hasCredentials: boolean; updatedAt: string }>
> {
  const rows = await db
    .prepare('SELECT platform, updated_at FROM credentials WHERE team_id = ?')
    .bind(teamId)
    .all<{ platform: string; updated_at: string }>();
  return (rows.results || []).map((r) => ({
    platform: r.platform,
    hasCredentials: true,
    updatedAt: r.updated_at,
  }));
}
