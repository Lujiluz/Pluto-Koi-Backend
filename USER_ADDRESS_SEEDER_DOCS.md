# User Address Seeder Documentation

## Overview

This seeder is designed to populate Indonesian addresses for existing users who don't have address information in the database. It was created after adding the `address` field to the User model.

## Files Created

- `/src/utils/userAddressSeeder.ts` - Main seeder functions
- `/src/scripts/seedUserAddresses.ts` - Standalone script runner
- Updated `/src/utils/seedData.ts` - Added address seeding to main seeder

## Features

### 1. Bulk Address Seeding

Seeds addresses for all users that don't have address information using random Indonesian addresses.

### 2. Individual User Seeding

Seed address for a specific user by email address.

### 3. User Listing

List all users without addresses for debugging purposes.

## Indonesian Addresses Included

The seeder includes 15 sample addresses from major Indonesian cities:

- Jakarta (DKI Jakarta)
- Yogyakarta (DI Yogyakarta)
- Bandung (Jawa Barat)
- Surabaya (Jawa Timur)
- Medan (Sumatera Utara)
- Denpasar (Bali)
- Bogor (Jawa Barat)
- Semarang (Jawa Tengah)
- Makassar (Sulawesi Selatan)
- Pontianak (Kalimantan Barat)
- Malang (Jawa Timur)
- Solo (Jawa Tengah)
- Pekanbaru (Riau)
- Palembang (Sumatera Selatan)
- Cirebon (Jawa Barat)

## Usage

### Method 1: Using the Script Runner (Recommended)

First, add the script to your package.json:

```json
{
  "scripts": {
    "seed:user-address": "tsx --env-file .env src/scripts/seedUserAddresses.ts"
  }
}
```

Then run:

```bash
# Seed addresses for all users without addresses
npm run seed:user-address seed

# List users without addresses
npm run seed:user-address list

# Seed address for specific user
npm run seed:user-address seed-user user@example.com

# Show available commands
npm run seed:user-address
```

### Method 2: Import and Use Functions

```typescript
import { seedUserAddresses, listUsersWithoutAddresses, seedAddressForUser } from "./src/utils/userAddressSeeder.js";

// Seed all users
await seedUserAddresses();

// List users without addresses
await listUsersWithoutAddresses();

// Seed specific user
await seedAddressForUser("user@example.com");
```

### Method 3: Use with Main Seeder

```typescript
import { runAllSeeders } from "./src/utils/seedData.js";

// This will run both category and user address seeders
await runAllSeeders();
```

## Query Logic

The seeder finds users without addresses using the following criteria:

- `address` field doesn't exist
- `address` is null
- `address.street` doesn't exist, is empty, or null
- User is not deleted (`deleted: false`)

## Safety Features

- Only updates users that don't have address information
- Preserves existing addresses
- Includes error handling for individual user updates
- Provides detailed logging for debugging
- Uses soft-delete aware queries

## Address Structure

Each address includes:

```typescript
interface IAddress {
  street: string; // e.g., "Jl. Sudirman No. 15"
  city: string; // e.g., "Jakarta"
  state: string; // e.g., "DKI Jakarta"
  zipCode: string; // e.g., "10220"
  country: string; // Always "Indonesia"
}
```

## Example Output

```
🌱 Starting user address seeding...
📍 Found 5 users without address information
✅ Updated address for user: John Doe (john@example.com)
   Address: Jl. Sudirman No. 15, Jakarta, DKI Jakarta 10220
✅ Updated address for user: Jane Smith (jane@example.com)
   Address: Jl. Malioboro No. 88, Yogyakarta, DI Yogyakarta 55271
✅ Address seeding completed. Updated 5 users.
```

## Notes

- The seeder uses random address assignment
- All addresses are valid Indonesian addresses with proper postal codes
- The seeder is idempotent - running it multiple times won't duplicate data
- Original user data (name, email, etc.) remains unchanged
