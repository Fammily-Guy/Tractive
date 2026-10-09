/**
 * Creates a staff password hash and a 2FA (TOTP) secret for ADMIN_USERS.
 *   npm run hash-password -- "a-long-password"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "a-password-of-12+-characters"');
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = `scrypt$${salt}$${scryptSync(password, salt, 32).toString("base64")}`;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const totpSecret = Array.from(randomBytes(20), (b) => alphabet[b % 32]).join("");

console.log("\npasswordHash:", hash);
console.log("totpSecret:  ", totpSecret);
console.log(`\nAdd to an authenticator app with this link (or type the secret in manually):`);
console.log(`otpauth://totp/Lubarsch%20Credit?secret=${totpSecret}&issuer=Lubarsch%20Credit\n`);
console.log("Example ADMIN_USERS entry:");
console.log(JSON.stringify([{ email: "you@lubarschcredit.com", name: "Your Name", role: "admin", passwordHash: hash, totpSecret }]));
