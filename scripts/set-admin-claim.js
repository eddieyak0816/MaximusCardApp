// Usage: node set-admin-claim.js <UID>
// Requires a service account JSON named serviceAccountKey.json in project root

const admin = require('firebase-admin');
const path = require('path');
const svcPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(svcPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (err) {
  console.error('Missing serviceAccountKey.json in project root or invalid file.');
  process.exit(1);
}

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin-claim.js <UID>');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { isAdmin: true })
  .then(() => console.log(`Admin claim set for uid ${uid}`))
  .catch(err => console.error('Error setting custom claim:', err));
