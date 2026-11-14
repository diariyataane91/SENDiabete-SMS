import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

// On crée une clé de secours si la variable n'est pas définie (pour le dev)
const getKey = () => {
  const raw = process.env.AES_KEY || '12345678901234567890123456789012'; // 32 caractères
  return Buffer.from(raw);
};

export function encrypt(plain: string): string {
  if (!plain) return '';
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function decrypt(payload: string): string {
  if (!payload) return '';
  const parts = payload.split(':');
  if (parts.length !== 4) return payload; // Si ce n'est pas crypté, on renvoie tel quel
  const [, ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}