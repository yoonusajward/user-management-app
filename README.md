# Junior Software Developer Technical Assessment

A simple user management application built with Next.js, TypeScript, Tailwind CSS, Firebase Authentication, and Cloud Firestore. It also includes a Fibonacci table generator.

## Features

### User management

- Email and password login and logout
- Protected pages
- User list with name and email search and 10 records per page
- Add, edit, and delete users
- Pre-filled edit form with an optional password change
- Active and inactive user status
- Confirmation before deletion; the signed-in user cannot delete their own account

### Fibonacci

- Enter Rows and Columns to generate a Fibonacci sequence in a table
- Validate positive whole numbers, with a limit of 20 for each input
- Use `BigInt` to keep large sequence values accurate

## Technologies and choices

- **Next.js and TypeScript:** Keep the interface and server-side API in one project, with type checking for the application code.
- **Firebase Authentication:** Manage sign-in and passwords without storing passwords in Firestore.
- **Cloud Firestore:** Store user profiles with name, email, status, and creation date.
- **Firebase Admin SDK:** Create, update, and delete Authentication users from server-side API routes.
- **Tailwind CSS:** Keep styling simple and focused on the assessment's functionality.

## Project setup

1. Clone the repository using the URL supplied with the submission, then enter the project directory:

   ```bash
   git clone YOUR_REPOSITORY_URL
   cd junior-developer-assessment
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Firebase project. Enable **Email/Password** in Firebase Authentication and create a Cloud Firestore database.

4. Copy `.env.example` to `.env.local` and fill in all values. The `NEXT_PUBLIC_FIREBASE_*` values come from the Firebase web app configuration. The `FIREBASE_ADMIN_*` values come from a Firebase service account. Keep `.env.local` private. For the private key, preserve the quoted value and `\n` line breaks shown in the example.

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell, use `Copy-Item .env.example .env.local` instead.

5. Configure Firestore rules to allow authenticated users to read the `users` collection. The client reads profiles and the user list directly from Firestore. Restrict client writes to match your intended access policy; create, update, and delete operations in this app use server API routes.

6. Create an initial test user in Firebase Authentication. Add a Firestore document at `users/{uid}`, using that Authentication user's UID as the document ID. Set `name` and `email` as strings, `status` to `active`, and `createdAt` to a Firestore timestamp. This initial user is needed to sign in; subsequent users can be added in the app.

7. Run the application:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

The client configuration uses:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

The server-side Admin SDK uses:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

See `.env.example` for the private key format. Never commit a real service account key or `.env.local`.

## Firestore user structure

Each document in the `users` collection has the Authentication UID as its ID:

```text
users/{uid}
  name: string
  email: string
  status: "active" | "inactive"
  createdAt: timestamp
```

Passwords are managed by Firebase Authentication and are never stored in Firestore.

## Assumptions

- Email addresses are unique.
- New passwords must contain at least 8 characters.
- An active Firestore profile is required to sign in.
- Any authenticated user can manage users; there are no separate administrator roles.
- The signed-in user cannot delete their own account.
- Leaving the password field empty when editing keeps the existing password.
- Search checks names and email addresses, and the list shows 10 users per page.
- Search and pagination run in the browser because the expected user count is small.
- Fibonacci Rows and Columns must be positive whole numbers, each no greater than 20.

## Fibonacci logic

The sequence begins `0, 1`. Each following value is the sum of the previous two. The app fills the requested table row by row and uses `BigInt` so larger values remain accurate.

## Security notes

- Firebase Authentication manages passwords.
- Firebase Admin credentials are used only in server-side code and do not have a `NEXT_PUBLIC_` prefix.
- User management API requests require a valid Firebase ID token.
- Firestore rules must be configured in the Firebase project; this repository does not include a rules file.
- The API validates user input before creating or updating a user.

## Known limitations

This is a time-limited assessment project. A larger production system would benefit from role-based permissions, server-side pagination, audit logs, stronger session management, automated tests, and more detailed form validation. Firebase Authentication and Firestore updates are separate operations, so a failure between them can leave their records out of sync.
