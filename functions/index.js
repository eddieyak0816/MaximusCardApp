const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Callable function to validate a PIN and return staff info
exports.validatePin = functions.https.onCall(async (data, context) => {
  const pin = String(data.pin || '').trim();
  if (!pin) throw new functions.https.HttpsError('invalid-argument', 'PIN is required.');

  const snapshot = await db.collection('staff').where('pin', '==', pin).limit(1).get();
  if (snapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'Invalid PIN');
  }
  const staff = snapshot.docs[0].data();
  // Return minimal info
  return { name: staff.name || '', role: staff.role || 'cashier' };
});

// Admin-only: add staff member
exports.adminAddStaff = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins may add staff');
  }
  const { name, pin, role } = data;
  if (!name || !pin) throw new functions.https.HttpsError('invalid-argument', 'Name and PIN required');

  const newDoc = await db.collection('staff').add({ name, pin: String(pin), role: role || 'cashier' });
  return { id: newDoc.id };
});

// Admin-only: update staff
exports.adminUpdateStaff = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins may update staff');
  }
  const { id, fields } = data;
  if (!id || !fields) throw new functions.https.HttpsError('invalid-argument', 'id and fields required');

  await db.collection('staff').doc(id).update(fields);
  return { ok: true };
});

// Admin-only: delete staff
exports.adminDeleteStaff = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins may delete staff');
  }
  const { id } = data;
  if (!id) throw new functions.https.HttpsError('invalid-argument', 'id required');

  await db.collection('staff').doc(id).delete();
  return { ok: true };
});