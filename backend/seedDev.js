import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

/* ─── Helpers ─── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const BRANDS = ['Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Lupin', 'Zydus Cadila', 'Glenmark', 'Torrent Pharma', 'Mankind', 'Himalaya', 'Dabur'];

const CATEGORY_TREE = [
  {
    name: 'Cancer Care',
    subcategories: ['Breast Cancer', 'Blood Cancer', 'Colon Cancer', 'Prostate Cancer', 'Lung Cancer', 'Multiple Myeloma', 'Kidney Cancer', 'Cervical Cancer', 'Liver Cancer', 'Ovarian Cancer', 'Pancreatic Cancer', 'Thyroid Cancer'],
  },
  {
    name: 'Skin Care',
    subcategories: ['Acne Care', 'Anti-Aging', 'Moisturizers', 'Sunscreen', 'Cleansers', 'Face Masks', 'Serums', 'Body Care'],
  },
  {
    name: 'Dental Care',
    subcategories: ['Toothpaste', 'Mouthwash', 'Toothbrushes', 'Dental Floss', 'Teeth Whitening', 'Gum Care', 'Oral Care Kits'],
  },
  {
    name: 'Wellness',
    subcategories: ['Immunity Boosters', 'Stress Relief', 'Sleep Aids', 'Detox', 'Energy Boosters', 'Herbal Remedies', 'Aromatherapy'],
  },
  {
    name: 'Reproductive Care',
    subcategories: ['Pregnancy Care', 'Fertility', 'Menstrual Health', 'Menopause', 'Sexual Wellness', 'Contraceptives', 'Postpartum'],
  },
  {
    name: 'Heart Care',
    subcategories: ['Blood Pressure', 'Cholesterol', 'Heart Supplements', 'Cardiac Devices', 'Stroke Prevention', 'Heart Health Kits'],
  },
  {
    name: 'Nutrition',
    subcategories: ['Protein Supplements', 'Vitamins', 'Minerals', 'Weight Management', 'Meal Replacements', 'Digestive Health', 'Superfoods'],
  },
  {
    name: 'Fitness',
    subcategories: ['Protein Powders', 'Pre-Workout', 'Post-Workout', 'Energy Drinks', 'Sports Nutrition', 'Recovery Aids', 'Gym Accessories'],
  },
  {
    name: 'Diabetes',
    subcategories: ['Blood Sugar Monitors', 'Insulin', 'Diabetic Foot Care', 'Diabetic Supplements', 'Test Strips', 'Lancets', 'Diabetic Socks'],
  },
  {
    name: 'Pet Care',
    subcategories: ['Pet Food', 'Pet Supplements', 'Pet Grooming', 'Pet Medicines', 'Pet Accessories', 'Pet Dental Care', 'Pet Flea & Tick'],
  },
];

const generateProduct = (subcategory, treeName, subcategoryId) => {
  const brand = sample(BRANDS);
  const price = rand(150, 3500);
  const discount = rand(0, 30);
  const discountPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : 0;
  const stock = rand(10, 500);
  const types = ['Capsules', 'Syrup', 'Cream', 'Spray', 'Gel', 'Powder', 'Drops', 'Kit', 'Tablets'];
  const qty = rand(10, 500);
  const type = sample(types);
  const name = `${brand} ${subcategory} ${type} - ${qty}${type === 'Syrup' || type === 'Drops' || type === 'Spray' ? 'ml' : type === 'Powder' || type === 'Cream' || type === 'Gel' ? 'g' : 'units'}`;
  const slug = slugify(`${brand}-${subcategory}-${Date.now()}-${rand(1000, 9999)}`, { lower: true });
  return {
    name,
    slug,
    description: `Premium quality ${subcategory} ${type.toLowerCase()} from ${brand}. Trusted by healthcare professionals for effective results.`,
    category: subcategoryId,
    brand,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'],
    price,
    discountPrice,
    stock,
    sku: `EVG-${slugify(brand, { lower: true }).slice(0, 3)}-${rand(10000, 99999)}`,
    benefits: [`Effective ${subcategory} management`, 'Clinically tested formula', 'Safe for long-term use'],
    dosage: 'Use as directed by physician',
    composition: 'Active ingredient complex with herbal extracts',
    status: 'active',
    rating: rand(30, 50) / 10,
    numReviews: rand(10, 200),
    isPrescriptionRequired: rand(0, 100) > 70,
    tags: [sample(['bestseller', 'popular', 'new', 'sale']), sample(['organic', 'ayurvedic'])],
    featured: rand(0, 100) > 80,
  };
};

const seedDev = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evigapharma');
    console.log('MongoDB Connected\n');

    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');

    if (shouldClear) {
      console.log('Clearing existing categories and products...');
      const delCats = await Category.deleteMany({});
      const delProds = await Product.deleteMany({});
      console.log(`  Deleted ${delCats.deletedCount} categories, ${delProds.deletedCount} products\n`);
    }

    const existingCats = await Category.countDocuments();
    const existingProds = await Product.countDocuments();
    console.log(`Current database state: ${existingCats} categories, ${existingProds} products`);

    if (existingCats > 0 && existingProds > 0 && !shouldClear) {
      console.log('\nDatabase already has data. Use --clear to reset and re-seed.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('\nSeeding categories...');
    const parentMap = {};
    const subMap = {};

    for (let i = 0; i < CATEGORY_TREE.length; i++) {
      const tree = CATEGORY_TREE[i];
      const parent = await Category.create({
        name: tree.name,
        slug: slugify(tree.name, { lower: true }),
        description: `Explore our wide range of ${tree.name} products for better health and wellness.`,
        parent: null,
        isActive: true,
        order: i + 1,
      });
      parentMap[tree.name] = parent._id;
      console.log(`  Parent: ${tree.name}`);

      for (let j = 0; j < tree.subcategories.length; j++) {
        const subName = tree.subcategories[j];
        const sub = await Category.create({
          name: subName,
          slug: slugify(`${tree.name}-${subName}`, { lower: true }),
          description: `Best ${subName} products for your health needs.`,
          parent: parent._id,
          isActive: true,
          order: j + 1,
        });
        subMap[subName] = sub._id;
      }
    }

    console.log('\nSeeding products (max 100)...');
    let productCount = 0;
    const MAX_PRODUCTS = 100;

    for (const tree of CATEGORY_TREE) {
      for (const subName of tree.subcategories) {
        const subId = subMap[subName];
        const numProducts = rand(1, 3); // 1-3 products per subcategory = ~70-210 max, but we cap at 100
        for (let k = 0; k < numProducts && productCount < MAX_PRODUCTS; k++) {
          const product = generateProduct(subName, tree.name, subId);
          await Product.create(product);
          productCount++;
        }
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`  Total categories: ${await Category.countDocuments()}`);
    console.log(`  Total products: ${productCount}`);
    console.log(`\nRun this script with --clear to reset all data.\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDev();
