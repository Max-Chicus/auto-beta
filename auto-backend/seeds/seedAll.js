require('dotenv').config();
const connectDB = require('../config/db'); // Importă connectDB

const Brand = require('../models/Brand');
const Model = require('../models/Model');
const Engine = require('../models/Engine');
const Year = require('../models/Year');
const Category = require('../models/Category');
const Product = require('../models/Product');

const runSeed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Șterg toate datele...');
    
    // Ordinea este IMPORTANTĂ din cauza foreign keys
    await Product.deleteMany();
    console.log('✅ Produse șterse');
    
    await Engine.deleteMany();
    console.log('✅ Motoare șterse');
    
    await Model.deleteMany();
    console.log('✅ Modele șterse');
    
    await Brand.deleteMany();
    console.log('✅ Brand-uri șterse');
    
    await Category.deleteMany();
    console.log('✅ Categorii șterse');
    
    await Year.deleteMany();
    console.log('✅ Ani șterși');

    // ===== BRANDS ===== (SALVĂ ÎN VARIABILE!)
    console.log('\n🏢 Creare brand-uri...');
    const audi = await Brand.create({ name: 'Audi' });
    const bmw = await Brand.create({ name: 'BMW' });
    const toyota = await Brand.create({ name: 'Toyota' });
    console.log('✅ 3 brand-uri create');

    // ===== MODELS ===== (cu ObjectId, nu string!)
    console.log('\n🚗 Creare modele...');
    const a4 = await Model.create({ name: 'A4', brand: audi._id });
    const a6 = await Model.create({ name: 'A6', brand: audi._id });
    const x5 = await Model.create({ name: 'X5', brand: bmw._id });
    const x3 = await Model.create({ name: 'X3', brand: bmw._id });
    const corolla = await Model.create({ name: 'Corolla', brand: toyota._id });
    console.log('✅ 5 modele create');

    // ===== ENGINES ===== (cu ObjectId, nu string!)
    console.log('\n⚙️  Creare motoare...');
    const enginesData = [
      { name: '1.6 benzina', model: a4._id },
      { name: '2.0 diesel', model: a4._id },
      { name: '2.0 benzina', model: a6._id },
      { name: '3.0 diesel', model: a6._id },
      { name: '3.0 diesel', model: x5._id },
      { name: 'Hybrid', model: x5._id },
      { name: '2.0 benzina', model: x3._id },
      { name: '1.6 benzina', model: corolla._id },
      { name: 'Hybrid', model: corolla._id },
    ];
    
    const createdEngines = [];
    for (const eng of enginesData) {
      const engine = await Engine.create(eng);
      createdEngines.push(engine);
    }
    console.log(`✅ ${createdEngines.length} motoare create`);

    // ===== YEARS =====
    console.log('\n📅 Creare ani...');
    const years = [2024, 2023, 2022, 2021, 2020];
    for (let y of years) await Year.create({ value: y });
    console.log(`✅ ${years.length} ani creați`);

    // ===== CATEGORIES =====
    console.log('\n📂 Creare categorii...');
    const categoriesData = ['Motor', 'Suspensie', 'Frâne', 'Caroserie', 'Electric'];
    const createdCategories = [];
    for (let c of categoriesData) {
      const category = await Category.create({ name: c });
      createdCategories.push(category);
    }
    console.log(`✅ ${createdCategories.length} categorii create`);

    // ===== PRODUCTS =====
    console.log('\n🛒 Creare produse...');
    
    // Găsește motoare specifice
    const engineA4_16 = await Engine.findOne({ name: '1.6 benzina', model: a4._id });
    const engineA4_20d = await Engine.findOne({ name: '2.0 diesel', model: a4._id });
    const engineA6_20 = await Engine.findOne({ name: '2.0 benzina', model: a6._id });
    const engineA6_30d = await Engine.findOne({ name: '3.0 diesel', model: a6._id });
    const engineX5_30d = await Engine.findOne({ name: '3.0 diesel', model: x5._id });
    const engineX5_hybrid = await Engine.findOne({ name: 'Hybrid', model: x5._id });
    const engineX3_20 = await Engine.findOne({ name: '2.0 benzina', model: x3._id });
    const engineCorolla_16 = await Engine.findOne({ name: '1.6 benzina', model: corolla._id });
    const engineCorolla_hybrid = await Engine.findOne({ name: 'Hybrid', model: corolla._id });

    // Verifică dacă toate motoarele au fost găsite
    const enginesFound = [
      engineA4_16, engineA4_20d, engineA6_20, engineA6_30d,
      engineX5_30d, engineX5_hybrid, engineX3_20,
      engineCorolla_16, engineCorolla_hybrid
    ];
    
    const missingEngines = enginesFound.filter(e => !e);
    if (missingEngines.length > 0) {
      console.warn('⚠️  Unele motoare nu au fost găsite:', missingEngines.length);
    }

    // Creează produse
    const productsData = [
      {
        name: 'Filtru de ulei Audi A4 1.6',
        price: 450,
        image: 'https://images.unsplash.com/photo-1563720223485-8d6d5c5c8c7e?w=400&h=300&fit=crop',
        brand: audi._id,
        model: a4._id,
        engine: engineA4_16?._id,
        year: 2022,
        category: createdCategories[0]._id // Motor
      },
      {
        name: 'Filtru de aer Audi A4 2.0 diesel',
        price: 320,
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop',
        brand: audi._id,
        model: a4._id,
        engine: engineA4_20d?._id,
        year: 2021,
        category: createdCategories[0]._id // Motor
      },
      {
        name: 'Kit distribuție Audi A6 2.0',
        price: 680,
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
        brand: audi._id,
        model: a6._id,
        engine: engineA6_20?._id,
        year: 2023,
        category: createdCategories[0]._id // Motor
      },
      {
        name: 'Amortizor frontal Audi A6 3.0',
        price: 950,
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
        brand: audi._id,
        model: a6._id,
        engine: engineA6_30d?._id,
        year: 2022,
        category: createdCategories[1]._id // Suspensie
      },
      {
        name: 'Amortizor BMW X5 3.0 diesel',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=400&h=300&fit=crop',
        brand: bmw._id,
        model: x5._id,
        engine: engineX5_30d?._id,
        year: 2023,
        category: createdCategories[1]._id // Suspensie
      },
      {
        name: 'Baterie BMW X5 Hybrid',
        price: 1250,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
        brand: bmw._id,
        model: x5._id,
        engine: engineX5_hybrid?._id,
        year: 2024,
        category: createdCategories[4]._id // Electric
      },
      {
        name: 'Plăcuțe frâne BMW X3 2.0',
        price: 380,
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop',
        brand: bmw._id,
        model: x3._id,
        engine: engineX3_20?._id,
        year: 2020,
        category: createdCategories[2]._id // Frâne
      },
      {
        name: 'Kit distribuție Toyota Corolla 1.6',
        price: 420,
        image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&h=300&fit=crop',
        brand: toyota._id,
        model: corolla._id,
        engine: engineCorolla_16?._id,
        year: 2021,
        category: createdCategories[0]._id // Motor
      },
      {
        name: 'Baterie Toyota Corolla Hybrid',
        price: 850,
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop',
        brand: toyota._id,
        model: corolla._id,
        engine: engineCorolla_hybrid?._id,
        year: 2024,
        category: createdCategories[4]._id // Electric
      },
      {
        name: 'Far Audi A6 2.0',
        price: 780,
        image: 'https://images.unsplash.com/photo-1563720223485-8d6d5c5c8c7e?w=400&h=300&fit=crop',
        brand: audi._id,
        model: a6._id,
        engine: engineA6_20?._id,
        year: 2023,
        category: createdCategories[3]._id // Caroserie
      }
    ];

    // Filtrează produsele care au toate referințele valide
    const validProducts = productsData.filter(p => 
      p.brand && p.model && p.engine && p.category
    );

    if (validProducts.length > 0) {
      await Product.insertMany(validProducts);
      console.log(`✅ ${validProducts.length} produse create`);
    } else {
      console.warn('⚠️  Niciun produs valid pentru a fi creat');
    }

    // STATISTICI FINALE
    console.log('\n🎉 SEED FINALIZAT CU SUCCES!');
    console.log('📊 Statistici finale:');
    console.log(`- Brands: ${await Brand.countDocuments()}`);
    console.log(`- Models: ${await Model.countDocuments()}`);
    console.log(`- Engines: ${await Engine.countDocuments()}`);
    console.log(`- Years: ${await Year.countDocuments()}`);
    console.log(`- Categories: ${await Category.countDocuments()}`);
    console.log(`- Products: ${await Product.countDocuments()}`);
    
    console.log('\n✅ Gata! Pornește backend-ul și frontend-ul.');
    console.log('Backend: npm start');
    console.log('Frontend: cd ../auto-frontend && npm start');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ EROARE LA SEED:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
};

// Rulează seed-ul
runSeed();