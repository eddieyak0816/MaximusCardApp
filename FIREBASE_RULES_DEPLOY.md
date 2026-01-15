Quick steps to deploy the new Firestore rules and make an admin user

1) Enable Authentication (if you haven't):
   - Firebase Console → Authentication → Sign-in method → enable Anonymous and Email/Password.

2) Publish the rules file:
   - Copy the contents of `firestore.rules` (created in your project root) into the Firebase Console → Firestore → Rules and click **Publish**
   OR
   - Use the Firebase CLI (recommended if you already have CLI set up):
     - `firebase login`
     - `firebase use --add` (select project `maximus-collectibles`)
     - `firebase deploy --only firestore:rules --project maximus-collectibles`

3) Create an admin account (easy method):
   - In Firebase Console → Authentication → Users → Add user (choose Email/Password) and note their UID.
   - Place your service account JSON file in project root as `serviceAccountKey.json`.
   - Run the script to set the admin claim:
     - `node scripts/set-admin-claim.js <UID>`

4) Verify:
   - Log in as that user (not anonymous) and the user's token will include `isAdmin: true` (token refresh may be necessary).
   - Try a staff write (e.g., add a staff member) from the UI — it should succeed only for admin user.

If you want, I can attempt to run the `firebase deploy` here for you (I will need your confirmation and Firebase CLI logged in), or I can walk you through each step interactively. If you prefer, I can also do the console paste and publish steps for you if you sign me in (I cannot access your Firebase console directly without your credentials).