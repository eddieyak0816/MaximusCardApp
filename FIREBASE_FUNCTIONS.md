Deploying the Cloud Functions

1) Install dependencies inside the `functions` folder:
   - `npm --prefix functions install`

2) Deploy functions to Firebase:
   - `npx firebase deploy --only functions --project maximus-collectibles`

What these functions do:
- `validatePin`: callable function that takes `{ pin }` and returns `{ name, role }` if PIN matches a staff doc.
- `adminAddStaff`, `adminUpdateStaff`, `adminDeleteStaff`: admin-only callables that perform staff writes securely.

Client changes:
- The app will call `validatePin` for login instead of querying Firestore directly.
- Admin actions in the app will call the admin callable functions (only available to auth users with `isAdmin: true`).

If you want, I can deploy the functions for you now (I have the Firebase CLI setup).