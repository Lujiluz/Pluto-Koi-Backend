import { UserModel, IAddress } from "../models/user.model.js";

/**
 * Indonesian sample addresses for seeding
 */
const INDONESIAN_ADDRESSES: IAddress[] = [
  {
    street: "Jl. Sudirman No. 15",
    city: "Jakarta",
    state: "DKI Jakarta",
    zipCode: "10220",
    country: "Indonesia",
  },
  {
    street: "Jl. Malioboro No. 88",
    city: "Yogyakarta",
    state: "DI Yogyakarta",
    zipCode: "55271",
    country: "Indonesia",
  },
  {
    street: "Jl. Asia Afrika No. 45",
    city: "Bandung",
    state: "Jawa Barat",
    zipCode: "40111",
    country: "Indonesia",
  },
  {
    street: "Jl. Ahmad Yani No. 123",
    city: "Surabaya",
    state: "Jawa Timur",
    zipCode: "60231",
    country: "Indonesia",
  },
  {
    street: "Jl. Imam Bonjol No. 67",
    city: "Medan",
    state: "Sumatera Utara",
    zipCode: "20112",
    country: "Indonesia",
  },
  {
    street: "Jl. Raya Denpasar-Ubud No. 99",
    city: "Denpasar",
    state: "Bali",
    zipCode: "80361",
    country: "Indonesia",
  },
  {
    street: "Jl. Pajajaran No. 234",
    city: "Bogor",
    state: "Jawa Barat",
    zipCode: "16143",
    country: "Indonesia",
  },
  {
    street: "Jl. Pangeran Diponegoro No. 156",
    city: "Semarang",
    state: "Jawa Tengah",
    zipCode: "50241",
    country: "Indonesia",
  },
  {
    street: "Jl. Sultan Hasanuddin No. 78",
    city: "Makassar",
    state: "Sulawesi Selatan",
    zipCode: "90111",
    country: "Indonesia",
  },
  {
    street: "Jl. Gajah Mada No. 321",
    city: "Pontianak",
    state: "Kalimantan Barat",
    zipCode: "78116",
    country: "Indonesia",
  },
  {
    street: "Jl. Veteran No. 445",
    city: "Malang",
    state: "Jawa Timur",
    zipCode: "65145",
    country: "Indonesia",
  },
  {
    street: "Jl. Pemuda No. 567",
    city: "Solo",
    state: "Jawa Tengah",
    zipCode: "57126",
    country: "Indonesia",
  },
  {
    street: "Jl. Thamrin No. 89",
    city: "Pekanbaru",
    state: "Riau",
    zipCode: "28131",
    country: "Indonesia",
  },
  {
    street: "Jl. Kemerdekaan No. 12",
    city: "Palembang",
    state: "Sumatera Selatan",
    zipCode: "30126",
    country: "Indonesia",
  },
  {
    street: "Jl. Hayam Wuruk No. 234",
    city: "Cirebon",
    state: "Jawa Barat",
    zipCode: "45121",
    country: "Indonesia",
  },
];

/**
 * Get a random Indonesian address
 */
function getRandomIndonesianAddress(): IAddress {
  const randomIndex = Math.floor(Math.random() * INDONESIAN_ADDRESSES.length);
  return INDONESIAN_ADDRESSES[randomIndex];
}

/**
 * Seed addresses for users that don't have address field populated
 */
export async function seedUserAddresses(): Promise<void> {
  try {
    console.log("🌱 Starting user address seeding...");

    // Find all users that don't have address or have incomplete address
    const usersWithoutAddress = await UserModel.find({
    //   deletedAt: null,
    //   $or: [{ address: { $exists: false } }, { address: null }, { "address.street": { $exists: false } }, { "address.street": "" }, { "address.street": null }],
    });

      console.log('userWithoutAddress: ', usersWithoutAddress);

    if (usersWithoutAddress.length === 0) {
      console.log("ℹ️  No users found without addresses. All users already have address information.");
      return;
    }

    console.log(`📍 Found ${usersWithoutAddress.length} users without address information`);

    let updatedCount = 0;

    for (const user of usersWithoutAddress) {
      try {
        const randomAddress = getRandomIndonesianAddress();

        await UserModel.findByIdAndUpdate(
          user._id,
          {
            address: randomAddress,
            updatedAt: new Date(),
          },
          { new: true }
        );

        console.log(`✅ Updated address for user: ${user.name} (${user.email})`);
        console.log(`   Address: ${randomAddress.street}, ${randomAddress.city}, ${randomAddress.state} ${randomAddress.zipCode}`);

        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update address for user ${user.name}: ${error}`);
      }
    }

    console.log(`✅ Address seeding completed. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error("❌ Error seeding user addresses:", error);
    throw error;
  }
}

/**
 * Seed addresses for specific user by email
 */
export async function seedAddressForUser(email: string): Promise<void> {
  try {
    console.log(`🌱 Seeding address for user: ${email}`);

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
      deleted: false,
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    if (user.address?.street) {
      console.log(`ℹ️  User ${email} already has an address`);
      return;
    }

    const randomAddress = getRandomIndonesianAddress();

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        address: randomAddress,
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log(`✅ Updated address for user: ${user.name} (${user.email})`);
    console.log(`   Address: ${randomAddress.street}, ${randomAddress.city}, ${randomAddress.state} ${randomAddress.zipCode}`);
  } catch (error) {
    console.error(`❌ Error seeding address for user ${email}:`, error);
    throw error;
  }
}

/**
 * Display users without addresses (for debugging)
 */
export async function listUsersWithoutAddresses(): Promise<void> {
  try {
    const usersWithoutAddress = await UserModel.find({
      deleted: false,
      $or: [{ address: { $exists: false } }, { address: null }, { "address.street": { $exists: false } }, { "address.street": "" }, { "address.street": null }],
    }).select("name email role createdAt");

    console.log(`📋 Users without addresses (${usersWithoutAddress.length} total):`);

    if (usersWithoutAddress.length === 0) {
      console.log("   ✅ All users have address information");
      return;
    }

    usersWithoutAddress.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
  } catch (error) {
    console.error("❌ Error listing users without addresses:", error);
    throw error;
  }
}
