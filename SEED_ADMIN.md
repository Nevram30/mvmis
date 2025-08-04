# Seed Admin User

This project includes a seed script that creates an initial admin user for the system.

## Admin User Details

- **Email**: `admin@mvmis.com`
- **Password**: `admin123`
- **Name**: System Administrator

## How to Run the Seed Script

### Option 1: Using npm script
```bash
npm run db:seed
```

### Option 2: Using Prisma directly
```bash
npx prisma db seed
```

## Important Security Notes

⚠️ **IMPORTANT**: Please change the default password immediately after first login!

The seed script:
- Creates an admin user with email `admin@mvmis.com`
- Sets a default password `admin123` (hashed with bcrypt)
- Marks the email as verified
- Will skip creation if the admin user already exists

## Usage in Development

1. Make sure your database is set up and migrated:
   ```bash
   npm run db:migrate:dev
   ```

2. Run the seed script:
   ```bash
   npm run db:seed
   ```

3. Start your development server:
   ```bash
   npm run dev
   ```

4. Navigate to the login page and use the admin credentials to sign in.

## Usage in Production

1. Run database migrations:
   ```bash
   npm run db:migrate
   ```

2. Run the seed script:
   ```bash
   npm run db:seed
   ```

3. **Immediately change the default password** after first login for security.

## Customizing the Admin User

To customize the admin user details, edit the `prisma/seed.ts` file and modify:
- Email address
- Default password
- Display name
- Any additional user properties

Then run the seed script again (it will skip if the user already exists).
