/**
 * Local multi-account registry for demo / friend trials without Supabase.
 * Passwords are salted + hashed with Web Crypto (PBKDF2). Not a substitute
 * for Supabase Auth in production deploys.
 */

const ACCOUNTS_KEY = "fitops-accounts-v1";
const SESSION_KEY = "fitops-session-v1";

export interface LocalAccountPublic {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

interface LocalAccountRecord extends LocalAccountPublic {
  passwordHash: string;
  salt: string;
}

interface AccountsFile {
  users: LocalAccountRecord[];
}

function readAccounts(): AccountsFile {
  if (typeof window === "undefined") return { users: [] };
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return { users: [] };
    const parsed = JSON.parse(raw) as AccountsFile;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

function writeAccounts(file: AccountsFile) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(file));
}

function bufferToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return bufferToHex(derived);
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(bytes.buffer);
}

export function listLocalAccounts(): LocalAccountPublic[] {
  return readAccounts().users.map(({ id, email, displayName, createdAt }) => ({
    id,
    email,
    displayName,
    createdAt,
  }));
}

export async function createLocalAccount(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<LocalAccountPublic> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const file = readAccounts();
  if (file.users.some((u) => u.email === email)) {
    throw new Error("An account with that email already exists on this device.");
  }
  const salt = randomSalt();
  const passwordHash = await hashPassword(input.password, salt);
  const record: LocalAccountRecord = {
    id: crypto.randomUUID(),
    email,
    displayName: input.displayName.trim() || email.split("@")[0],
    createdAt: new Date().toISOString(),
    passwordHash,
    salt,
  };
  file.users.push(record);
  writeAccounts(file);
  return {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    createdAt: record.createdAt,
  };
}

export async function verifyLocalAccount(
  email: string,
  password: string,
): Promise<LocalAccountPublic> {
  const normalized = email.trim().toLowerCase();
  const user = readAccounts().users.find((u) => u.email === normalized);
  if (!user) throw new Error("No account found for that email.");
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) throw new Error("Incorrect password.");
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

export function setLocalSession(userId: string | null) {
  if (typeof window === "undefined") return;
  if (!userId) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function getLocalSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string };
    return parsed.userId ?? null;
  } catch {
    return null;
  }
}

export function getLocalAccountById(id: string): LocalAccountPublic | null {
  const user = readAccounts().users.find((u) => u.id === id);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

export function deleteLocalAccount(userId: string) {
  const file = readAccounts();
  file.users = file.users.filter((u) => u.id !== userId);
  writeAccounts(file);
  if (getLocalSessionUserId() === userId) setLocalSession(null);
}
