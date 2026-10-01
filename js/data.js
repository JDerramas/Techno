/**
 * Apex State University (ASU) - UniWear Visual Catalog & Smart Reservation Portal
 * Real Photography Mock Data & Sizing Tables
 */

const CAMPUS_DEPARTMENTS = [
  { code: 'CICS', name: 'College of Information & Computing Sciences (BSCS, BSIT, BSIS)' },
  { code: 'CBAA', name: 'College of Business Administration & Accountancy (BSA, BSBA)' },
  { code: 'COED', name: 'College of Education (BSED, BEED)' },
  { code: 'COE', name: 'College of Engineering (BSCE, BSEE, BSME)' },
  { code: 'CAS', name: 'College of Arts and Sciences (BA Comm, BS Psych)' },
  { code: 'CCJ', name: 'College of Criminology & Justice' },
  { code: 'CHTM', name: 'College of Hospitality & Tourism Management' }
];

const CAMPUS_TIME_SLOTS = [
  '08:30 AM - 10:30 AM (Batch 1 Morning)',
  '10:30 AM - 12:30 PM (Batch 2 Midday)',
  '01:30 PM - 03:30 PM (Batch 3 Afternoon)',
  '03:30 PM - 05:00 PM (Batch 4 Late Afternoon)'
];

const INITIAL_CATALOG = [
  {
    id: 'asu-polo-male',
    name: 'Official Male Collegiate Polo Barong',
    category: 'general',
    dept: 'all',
    gender: 'Male',
    price: 420,
    description: 'Crisp, lightweight premium linen-cotton polo barong with tailored navy piping on collar and embroidered University seal on the left chest.',
    material: 'Linen-Cotton Twill Blend (Anti-Wrinkle)',
    imageSrc: 'images/male_polo.jpg',
    sizes: { 'XS': 8, 'S': 18, 'M': 28, 'L': 20, 'XL': 10, '2XL': 4, '3XL': 1 }
  },
  {
    id: 'asu-blouse-female',
    name: 'Official Female Tailored Blouse with Ribbon',
    category: 'general',
    dept: 'all',
    gender: 'Female',
    price: 390,
    description: 'Form-fitting tailored white collegiate uniform blouse with detachable navy satin neck ribbon and embroidered university heraldry.',
    material: 'Fine Tetoron Cotton (Breathable)',
    imageSrc: 'images/female_blouse.jpg',
    sizes: { 'XS': 12, 'S': 24, 'M': 32, 'L': 25, 'XL': 12, '2XL': 5, '3XL': 2 }
  },
  {
    id: 'asu-slacks-male',
    name: 'Official Male Formal Tailored Slacks',
    category: 'general',
    dept: 'all',
    gender: 'Male',
    price: 450,
    description: 'Slim-straight cut deep navy formal dress trousers with reinforced belt loops and center press line. Matches university formal attire.',
    material: 'Gabardine Wool Blend (Formal Finish)',
    imageSrc: 'images/male_slacks.jpg',
    sizes: { 'XS': 6, 'S': 14, 'M': 26, 'L': 18, 'XL': 8, '2XL': 3, '3XL': 0 }
  },
  {
    id: 'asu-skirt-female',
    name: 'Official Female Pleated A-Line Skirt',
    category: 'general',
    dept: 'all',
    gender: 'Female',
    price: 420,
    description: 'Knee-length A-line pleated skirt in royal collegiate navy with gold crest embroidery and concealed side zipper with secure pocket.',
    material: 'High-Density Poly-Viscose Pleated Fabric',
    imageSrc: 'images/female_skirt.jpg',
    sizes: { 'XS': 9, 'S': 20, 'M': 30, 'L': 22, 'XL': 9, '2XL': 2, '3XL': 0 }
  },
  {
    id: 'asu-pe-shirt',
    name: 'University Athletics PE Dry-Fit Shirt',
    category: 'pe',
    dept: 'all',
    gender: 'Unisex',
    price: 320,
    description: 'Performance-grade navy and golden yellow athletic moisture-wicking jersey featuring bold collegiate athletics chest insignia.',
    material: 'Micro-Mesh CoolDry Polyester',
    imageSrc: 'images/pe_shirt.jpg',
    sizes: { 'XS': 20, 'S': 35, 'M': 50, 'L': 40, 'XL': 22, '2XL': 10, '3XL': 5 }
  },
  {
    id: 'asu-pe-pants',
    name: 'University Athletics PE Track Jogger Pants',
    category: 'pe',
    dept: 'all',
    gender: 'Unisex',
    price: 380,
    description: 'Tapered sports joggers with bold collegiate gold double side stripes, comfortable elastic drawstring waistband, and zippered pockets.',
    material: 'Heavyweight Poly-Cotton French Terry',
    imageSrc: 'images/pe_pants.jpg',
    sizes: { 'XS': 15, 'S': 28, 'M': 42, 'L': 30, 'XL': 15, '2XL': 6, '3XL': 3 }
  },
  {
    id: 'asu-varsity-jacket',
    name: 'Collegiate Letterman Varsity Bomber Jacket',
    category: 'department',
    dept: 'all',
    gender: 'Unisex',
    price: 780,
    description: 'Premium heavyweight university letterman jacket with genuine leather-feel sleeves, chenille university collegiate crest, and quilt thermal lining.',
    material: 'Melton Wool Body & Vegan Leather Sleeves',
    imageSrc: 'images/varsity_jacket.jpg',
    sizes: { 'XS': 5, 'S': 12, 'M': 18, 'L': 14, 'XL': 8, '2XL': 3, '3XL': 1 }
  },
  {
    id: 'asu-dept-tech',
    name: 'CICS Tech Vanguard Department Polo',
    category: 'department',
    dept: 'CICS',
    gender: 'Unisex',
    price: 360,
    description: 'Midnight slate departmental collared shirt with neon cyan piping and embroidered Computer Science & Engineering emblem.',
    material: 'Honeycomb Pique Cotton (230 GSM)',
    imageSrc: 'images/dept_tech.jpg',
    sizes: { 'XS': 6, 'S': 16, 'M': 24, 'L': 18, 'XL': 7, '2XL': 2, '3XL': 0 }
  },
  {
    id: 'asu-dept-ba',
    name: 'CBAA Corporate Executive Department Polo',
    category: 'department',
    dept: 'CBAA',
    gender: 'Unisex',
    price: 360,
    description: 'Rich burgundy corporate polo with metallic gold embroidery representing Business Administration and Accountancy students.',
    material: '100% Combed Compact Cotton',
    imageSrc: 'images/dept_ba.jpg',
    sizes: { 'XS': 4, 'S': 14, 'M': 20, 'L': 15, 'XL': 6, '2XL': 1, '3XL': 0 }
  },
  {
    id: 'asu-lanyard',
    name: 'Official University Gold-Foil Lanyard & Case',
    category: 'accessory',
    dept: 'all',
    gender: 'Unisex',
    price: 95,
    description: 'Heavy satin royal navy ribbon with gold foil metallic lettering, durable metal swivel clasp, and crystal-clear polycarbonate ID card holder.',
    material: 'Sublimated Satin & Reinforced Alloy Clip',
    imageSrc: 'images/lanyard.jpg',
    sizes: { 'Standard': 120 }
  }
];

const INITIAL_RESERVATIONS = [
  {
    refCode: 'KA-2026-X941K',
    createdAt: '2026-10-01T09:30:00',
    studentName: 'Julian Angelo Santos',
    studentId: '2024-10822-KA',
    department: 'College of Information & Computing Sciences',
    yearLevel: '3rd Year',
    contact: '09178239012',
    pickupDate: '2026-10-05',
    pickupSlot: '10:30 AM - 12:30 PM (Batch 2 Midday)',
    items: [
      { productId: 'asu-polo-male', productName: 'Official Male Collegiate Polo Barong', size: 'L', quantity: 2, price: 420, imageSrc: 'images/male_polo.jpg' },
      { productId: 'asu-slacks-male', productName: 'Official Male Formal Tailored Slacks', size: 'L', quantity: 1, price: 450, imageSrc: 'images/male_slacks.jpg' },
      { productId: 'asu-lanyard', productName: 'Official University Gold-Foil Lanyard & Case', size: 'Standard', quantity: 1, price: 95, imageSrc: 'images/lanyard.jpg' }
    ],
    totalAmount: 1385,
    status: 'Ready for Pickup',
    notes: 'Paid via student advance clearance'
  },
  {
    refCode: 'KA-2026-W379P',
    createdAt: '2026-10-01T14:15:00',
    studentName: 'Samantha Nicole Reyes',
    studentId: '2023-08451-KA',
    department: 'College of Business Administration & Accountancy',
    yearLevel: '2nd Year',
    contact: '09285512940',
    pickupDate: '2026-10-06',
    pickupSlot: '01:30 PM - 03:30 PM (Batch 3 Afternoon)',
    items: [
      { productId: 'asu-blouse-female', productName: 'Official Female Tailored Blouse with Ribbon', size: 'M', quantity: 2, price: 390, imageSrc: 'images/female_blouse.jpg' },
      { productId: 'asu-skirt-female', productName: 'Official Female Pleated A-Line Skirt', size: 'M', quantity: 1, price: 420, imageSrc: 'images/female_skirt.jpg' }
    ],
    totalAmount: 1200,
    status: 'Pending',
    notes: 'Morning claim preferred if available'
  },
  {
    refCode: 'KA-2026-Q882M',
    createdAt: '2026-09-30T11:20:00',
    studentName: 'Marco Antonio David',
    studentId: '2025-01103-KA',
    department: 'College of Engineering',
    yearLevel: '1st Year',
    contact: '09951234882',
    pickupDate: '2026-10-02',
    pickupSlot: '08:30 AM - 10:30 AM (Batch 1 Morning)',
    items: [
      { productId: 'asu-pe-shirt', productName: 'University Athletics PE Dry-Fit Shirt', size: 'XL', quantity: 1, price: 320, imageSrc: 'images/pe_shirt.jpg' },
      { productId: 'asu-pe-pants', productName: 'University Athletics PE Track Jogger Pants', size: 'XL', quantity: 1, price: 380, imageSrc: 'images/pe_pants.jpg' }
    ],
    totalAmount: 700,
    status: 'Claimed',
    notes: 'Verified and released at Supply Counter A'
  }
];

const SIZE_GUIDE_DATA = {
  tops: [
    { size: 'XS', chestIn: '34 - 36', chestCm: '86 - 91', lengthIn: '26', lengthCm: '66', shoulderIn: '16.5' },
    { size: 'S', chestIn: '36 - 38', chestCm: '91 - 96', lengthIn: '27', lengthCm: '68.5', shoulderIn: '17.5' },
    { size: 'M', chestIn: '38 - 40', chestCm: '96 - 101', lengthIn: '28', lengthCm: '71', shoulderIn: '18.5' },
    { size: 'L', chestIn: '40 - 42', chestCm: '101 - 106', lengthIn: '29', lengthCm: '73.5', shoulderIn: '19.5' },
    { size: 'XL', chestIn: '42 - 44', chestCm: '106 - 112', lengthIn: '30', lengthCm: '76', shoulderIn: '20.5' },
    { size: '2XL', chestIn: '44 - 46', chestCm: '112 - 117', lengthIn: '31', lengthCm: '78.5', shoulderIn: '21.5' },
    { size: '3XL', chestIn: '46 - 48', chestCm: '117 - 122', lengthIn: '32', lengthCm: '81', shoulderIn: '22.5' }
  ],
  bottoms: [
    { size: 'XS', waistIn: '26 - 28', waistCm: '66 - 71', hipsIn: '34 - 36', lengthIn: '37', lengthCm: '94' },
    { size: 'S', waistIn: '28 - 30', waistCm: '71 - 76', hipsIn: '36 - 38', lengthIn: '38', lengthCm: '96.5' },
    { size: 'M', waistIn: '30 - 32', waistCm: '76 - 81', hipsIn: '38 - 40', lengthIn: '39', lengthCm: '99' },
    { size: 'L', waistIn: '32 - 34', waistCm: '81 - 86', hipsIn: '40 - 42', lengthIn: '40', lengthCm: '101.5' },
    { size: 'XL', waistIn: '34 - 36', waistCm: '86 - 91', hipsIn: '42 - 44', lengthIn: '41', lengthCm: '104' },
    { size: '2XL', waistIn: '36 - 38', waistCm: '91 - 96', hipsIn: '44 - 46', lengthIn: '41.5', lengthCm: '105.5' },
    { size: '3XL', waistIn: '38 - 40', waistCm: '96 - 101', hipsIn: '46 - 48', lengthIn: '42', lengthCm: '106.5' }
  ]
};
