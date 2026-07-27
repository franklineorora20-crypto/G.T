import { ServiceItem, Branch, Order, MembershipPlan, Review } from '../types';

export const LOGO_URL = "https://lh3.googleusercontent.com/aida/AP1WRLv6-gTKRYzwnY-etCoMNFWjJMmOzKtaGGN2VudDO12BVqbWVpZYdE0ThaRAKJmLb71tJh1AAOze8Db3M9-xN01408jdQfyGUSCCOkxaeTuvBsNgZwKwfqaLnvYl_ig-vB_AnK4nrd02H4NZrxdxxhbX0TLsD7K3n2aAMihAkE42Rl-3FtHxj3cY7ZEgosVZjTergk0o0RygaGO1Br8MJDLb1XjD6h0BPYnE-Nu2vLsei4g4IVI_7YwNAGU";

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 's-1',
    name: 'Wash & Fold Laundry',
    category: 'laundry',
    price: 180,
    priceUnit: 'per kg',
    turnaround: '24 Hours',
    description: 'Everyday laundry using eco-friendly detergents, premium fabric conditioner, dried and neatly machine-folded.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFRFvYBreEBVNW93diXbcrk2NZPss9pV_YIAkMUFi7Mu-wkCk2O2F1GWtCv_OAsIA1DNRIf78DldrF30GDOdwCTLxSLb49Po0jAkFk0ArhMQNdrGr-46RJcwkLIW0RwCpTRaw8vral4Lcl2u8_z-dGukWBNDjTJuaLeTsTQegOnK5lsQZCpZxZNT5H62oOTZW3H9tz9FQkrhxfVybycl99PEv7Sq9rnyQhakwCF7TZSWbvGWGAd-DY6ag0N6J9XtCHYHLnxCbSsIk',
    popular: true,
    features: ['Eco-friendly detergent', 'Fresh scent treatment', 'Separated lights & darks', 'Neat precision folding']
  },
  {
    id: 's-2',
    name: 'Wash & Iron (Executive)',
    category: 'laundry',
    price: 280,
    priceUnit: 'per kg',
    turnaround: '24 Hours',
    description: 'Full washing, softening, crisp steam pressing, and hanger/folded finish ideal for workwear and daily suits.',
    popular: false,
    features: ['Crisp steam pressing', 'Hanger or folded packing', 'Starch preference options', 'Color protection wash']
  },
  {
    id: 's-3',
    name: 'Suit & Tuxedo Dry Cleaning',
    category: 'dry-cleaning',
    price: 600,
    priceUnit: 'per 2-pc suit',
    turnaround: '24-48 Hours',
    description: 'Chemical-free, fiber-safe solvent cleaning for 2-piece suits, blazers, and formal evening wear.',
    popular: true,
    features: ['Stain pre-treatment', 'Hand-finished lapels', 'Breathable garment bag', 'Fabric revitalization']
  },
  {
    id: 's-4',
    name: 'Silk & Delicate Dress Cleaning',
    category: 'dry-cleaning',
    price: 550,
    priceUnit: 'per item',
    turnaround: '48 Hours',
    description: 'Gentle wet-clean or dry-clean process tailored for silk, chiffon, lace, and embellished gowns.',
    popular: false,
    features: ['Individual mesh care', 'No harsh chemicals', 'Shape retention drying', 'Delicate steam finishing']
  },
  {
    id: 's-5',
    name: 'Single & Double Duvet Deep Wash',
    category: 'duvet-clinic',
    price: 800,
    priceUnit: 'per duvet',
    turnaround: '24 Hours',
    description: 'High-volume machine wash and thermo-sanitizing dry for single/double fiberfill and feather duvets.',
    popular: true,
    features: ['Allergen extraction', '99.9% dust-mite neutralization', 'Plump loft restoration', 'Vacuum sealed return']
  },
  {
    id: 's-6',
    name: 'King & Queen Heavy Duvet Clinic',
    category: 'duvet-clinic',
    price: 1200,
    priceUnit: 'per duvet',
    turnaround: '24 Hours',
    description: 'Heavy duty deep cleaning for large king/queen size heavy duvets, comforters, and thick winter quilts.',
    popular: true,
    features: ['Thermal sanitization', 'Anti-fungal rinse', 'Deep stain removal', 'Protective carry sleeve']
  },
  {
    id: 's-7',
    name: 'Plush Carpet & Rug Cleaning',
    category: 'carpet-cleaning',
    price: 250,
    priceUnit: 'per sq meter',
    turnaround: '48 Hours',
    description: 'Deep extraction steam cleaning for household living room carpets, hallway runners, and woolen rugs.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQhs8fYKq1Mx-BHvcne2U2apFbcqEyIqCQsi4pw6652nOdFNWkNq0XQYfYPMjaRps25mxRVpwInN7aSf0YylSnnen8YHUVoI6h2kumBeDMiVrTXs9Ohi7gVXRIwpPAPNsRT8kOzjC4ddrrsvXlOp5Lp9Ur-mGHa-ztof3hW8SBZ91E-BwU0R4YfAMWyzBuko3oOisdK5v-Cs4w1VJGc58pdky4XlsrB3NW-44aKaMjprEvrBxHdhWoIKK4rFSCXdqM1m_DNSnigMc',
    popular: false,
    features: ['Deep pile dirt extraction', 'Odour neutralizing treatment', 'Pet stain removal', 'Fast dry technology']
  },
  {
    id: 's-8',
    name: 'Curtains & Heavy Drapes Wash',
    category: 'carpet-cleaning',
    price: 350,
    priceUnit: 'per panel',
    turnaround: '48 Hours',
    description: 'Specialized cleaning for living room blackout curtains, velvet drapes, and sheer netting.',
    popular: false,
    features: ['Dust extraction', 'Fabric shrinkage protection', 'Steam pleat setting', 'Ring & hook preservation']
  },
  {
    id: 's-9',
    name: 'Janitorial & Office Deep Cleaning',
    category: 'janitorial',
    price: 3500,
    priceUnit: 'starting rate',
    turnaround: 'Scheduled',
    description: 'Full commercial janitorial cleaning for offices, apartments, retail stores, and post-construction spaces.',
    popular: false,
    features: ['Floor scrubbing & polishing', 'Window & glass polishing', 'Sanitized washrooms', 'Custom recurring schedules']
  },
  {
    id: 's-10',
    name: 'Leather Jacket & Boot Revitalize',
    category: 'dry-cleaning',
    price: 900,
    priceUnit: 'per item',
    turnaround: '72 Hours',
    description: 'Conditioning, stain treatment, and shine restoration for genuine leather jackets, coats, and suede boots.',
    popular: false,
    features: ['Natural oil conditioning', 'Suppleness restoration', 'Waterproof coating', 'Mildew defense']
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-rongai',
    name: 'Rongai Branch',
    locationName: 'Rongai, Kajiado North',
    fullAddress: 'Hill Valley Place Magadi Road, near Magenche, Rongai',
    phone: '0777349743',
    phoneDisplay: '0777 349 743',
    whatsapp: '254777349743',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIauRqDwNNseA1BWDS5DVN4CUlRPdOdbW50FQr8JNx5k9j8J3hiT8nWvdVevf0unx4psPitfXiPwq1fMBIJsuAIvRlvCWvv1B_H29Y1_NiHTCezSclJRq9yy-e2MnwJefxDeK2t3oR-8FdnDInEXeimfkfzSkfrn7Q1dleXJaBQ4WPC6iyeGgXk42jvY3hJTrFp2j4YuMIwcJM1lBrRXLevB9RygPJPcBfkxfOeRrrVbmVsSwwOeQ4HuorLNYJtgHcLi3zyFqPX0A',
    mapQuery: 'Hill Valley Place Magadi Road Rongai',
    hours: 'Mon - Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 5:00 PM'
  },
  {
    id: 'b-ngong',
    name: 'Ngong Branch',
    locationName: 'Ngong Town, Kajiado',
    fullAddress: 'Ngong Town, Country Arcade',
    phone: '0777140102',
    phoneDisplay: '0777 140 102',
    whatsapp: '254777140102',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7d5Wgn8EPWwo6TWYedEzul0jxh3KOdoKNQ0Uv2J5ooFxewjkQF9yPq-ORDdJdeoPmk2ayVnQr9LVVW7T4RAQdVDJkKm7xt_e70iN58NuMBj5OaTfYem8C5Kxtxl0Fy6Z86226nB8Kh0JSQgVGpQOAn_If6S-ccJdyx_faEDo6MFywjxj3nikjRG3MTqsQYvYMPPdv8boeJfrRjlr63zvDWbdN5VkV0DNv4of2AG5oZif0xkOyKont6MjhleV-ObSTFGSWUlj_7ks',
    mapQuery: 'Country Arcade Ngong Town',
    hours: 'Mon - Sat: 7:00 AM - 8:00 PM | Sun: 9:00 AM - 5:00 PM'
  }
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'GT-8829',
    customerName: 'Faith Wanjiku',
    phone: '0777349743',
    branch: 'Rongai Branch',
    address: 'Hill Valley Place, Magadi Road, Rongai',
    items: [
      { serviceName: 'Premium Wash & Fold (7 kg)', quantity: 7, unitPrice: 180 },
      { serviceName: 'Duvet Cleaning (2-pc special)', quantity: 1, unitPrice: 1400 }
    ],
    totalPrice: 2660,
    status: 'In Wash & Revitalizing',
    createdAt: 'Today, 09:30 AM',
    estimatedDelivery: 'Tomorrow, 04:00 PM',
    paymentStatus: 'Paid via M-Pesa',
    mpesaRef: 'RKS998210M',
    deliveryType: 'Delivery to Door',
    specialNotes: 'Driver currently at Ngong Road hub on route to Hill Valley Place.',
    trackingNotes: [
      { time: '09:30 AM, Today', note: 'Order received at Rongai Hub.', status: 'Order Received' },
      { time: '11:15 AM, Today', note: 'Washing/Cleaning initiated in Eco Drum #2.', status: 'Inspection & Sorting' },
      { time: '12:45 PM, Today', note: 'Ironing/Folding in progress with crisp steam press.', status: 'In Wash & Revitalizing' }
    ]
  },
  {
    id: 'GL-1234',
    customerName: 'David Njoroge',
    phone: '0712 345 678',
    branch: 'Rongai Branch',
    address: 'Hill Valley Estate, Magadi Rd, Rongai',
    items: [
      { serviceName: 'Wash & Fold Laundry (6 kg)', quantity: 6, unitPrice: 180 },
      { serviceName: 'King Heavy Duvet Clinic', quantity: 1, unitPrice: 1200 }
    ],
    totalPrice: 2280,
    status: 'In Wash & Revitalizing',
    createdAt: 'Today, 09:15 AM',
    estimatedDelivery: 'Tomorrow, 04:00 PM',
    paymentStatus: 'Paid via M-Pesa',
    mpesaRef: 'RKL892104X',
    deliveryType: 'Delivery to Door',
    specialNotes: 'Please extra fabric softener for duvet and lavender scent spray.',
    trackingNotes: [
      { time: '09:15 AM', note: 'Order collected at customer address by Goldtribe Express Rider (James).', status: 'Order Received' },
      { time: '10:00 AM', note: 'Order logged at Rongai Hub. Garments tagged, weighed and stain inspected.', status: 'Inspection & Sorting' },
      { time: '11:30 AM', note: 'Loaded into Eco-Wash Drum #4 with thermal sanitizing bath.', status: 'In Wash & Revitalizing' }
    ]
  },
  {
    id: 'GL-2089',
    customerName: 'Grace Mutua',
    phone: '0722 987 654',
    branch: 'Ngong Branch',
    address: 'Matasia, Ngong-Kiserian Rd',
    items: [
      { serviceName: 'Suit Dry Cleaning (2-pc)', quantity: 2, unitPrice: 600 },
      { serviceName: 'Silk Dress Dry Cleaning', quantity: 1, unitPrice: 550 }
    ],
    totalPrice: 1750,
    status: 'Ready for Pickup / Out for Delivery',
    createdAt: 'Yesterday, 11:30 AM',
    estimatedDelivery: 'Today, 05:00 PM',
    paymentStatus: 'Paid via M-Pesa',
    mpesaRef: 'RKM554312Z',
    deliveryType: 'Delivery to Door',
    specialNotes: 'Hang suits in breathable garment bags.',
    trackingNotes: [
      { time: 'Yesterday 11:30 AM', note: 'Dropped off at Ngong Branch (Country Arcade).', status: 'Order Received' },
      { time: 'Yesterday 02:00 PM', note: 'Chemical-free delicate dry clean completed.', status: 'In Wash & Revitalizing' },
      { time: 'Today 09:00 AM', note: 'Passed 5-point quality check. Steam pressed and packaged.', status: 'Quality Check' },
      { time: 'Today 01:15 PM', note: 'Out for doorstep delivery with Rider Peter (0777140102).', status: 'Ready for Pickup / Out for Delivery' }
    ]
  },
  {
    id: 'GL-3041',
    customerName: 'Amina Hassan',
    phone: '0733 112 233',
    branch: 'Rongai Branch',
    address: 'Rimpa, Rongai',
    items: [
      { serviceName: 'Plush Carpet Cleaning (12 sq.m)', quantity: 12, unitPrice: 250 }
    ],
    totalPrice: 3000,
    status: 'Quality Check',
    createdAt: '22 Jul 2026, 02:00 PM',
    estimatedDelivery: 'Today, 06:00 PM',
    paymentStatus: 'Pay on Delivery',
    deliveryType: 'Delivery to Door',
    trackingNotes: [
      { time: '22 Jul 02:00 PM', note: 'Carpet picked up from Rimpa residence.', status: 'Order Received' },
      { time: '23 Jul 10:00 AM', note: 'Deep steam pile extraction and stain removal performed.', status: 'In Wash & Revitalizing' },
      { time: 'Today 10:30 AM', note: 'Final inspection for moisture and scent audit completed.', status: 'Quality Check' }
    ]
  }
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'mem-1',
    name: 'Gold Starter',
    price: 3500,
    period: 'per month',
    description: 'Perfect for busy single professionals in Rongai & Ngong needing clean clothes weekly without stress.',
    features: [
      'Up to 20kg Wash & Fold per month',
      'Free Doorstep Pickup & Delivery twice a month',
      '1 Free Duvet Wash per month',
      '10% Discount on Dry Cleaning',
      'Priority 24-hr Turnaround'
    ],
    popular: false,
    color: 'border-outline-variant bg-white'
  },
  {
    id: 'mem-2',
    name: 'Gold Family Pass',
    price: 7500,
    period: 'per month',
    description: 'Complete household package designed to handle laundry and duvets for 3-5 family members.',
    features: [
      'Up to 55kg Wash & Fold per month',
      'Free Unlimited Weekly Doorstep Pickups',
      '3 Free King Duvet Washes per month',
      '2 Free Suits / Dresses Dry Cleaned',
      '20% Discount on Carpet Cleaning',
      'Dedicated Express Support Agent'
    ],
    popular: true,
    color: 'border-secondary-container bg-gradient-to-br from-white via-[#fdf8eb] to-[#fed65b]/20 shadow-xl ring-2 ring-[#fed65b]'
  },
  {
    id: 'mem-3',
    name: 'Commercial Executive',
    price: 18000,
    period: 'per month',
    description: 'Tailored for boutique hotels, Airbnb hosts, law firms, and offices needing pristine linens and uniforms.',
    features: [
      'Up to 150kg Commercial Wash & Iron',
      'Daily Scheduled Pickup & Return',
      'Free Starch & Hanger Packaging',
      'Janitorial Office Floor Polish Voucher',
      'Monthly Invoicing & VAT Receipts',
      '12-Hour Emergency Express Service'
    ],
    popular: false,
    color: 'border-outline-variant bg-white'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r-1',
    author: 'Eng. Kevin Ochieng',
    branch: 'Rongai Branch',
    rating: 5,
    comment: 'Goldtribe Link rescued my expensive wool suit before an executive conference in Upperhill. Cleaned, pressed, and delivered back to Hill Valley in under 24 hours. Usafi: Kazi Yetu is truly their standard!',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 'r-2',
    author: 'Dr. Sarah Wambui',
    branch: 'Ngong Branch',
    rating: 5,
    comment: 'Their Duvet Clinic is unbeatable! My heavy king size duvet came back smelling like a luxury spa and packed in a nice clear bag. Highly recommend Country Arcade branch.',
    date: '1 week ago',
    verified: true
  },
  {
    id: 'r-3',
    author: 'Brian & Cynthia',
    branch: 'Rongai Branch',
    rating: 5,
    comment: 'We subscribed to the Gold Family Pass 3 months ago and our weekends are completely freed up. Riders are super punctual on Magadi Road.',
    date: '3 days ago',
    verified: true
  }
];

export const FAQS = [
  {
    q: 'How does doorstep pickup and delivery work in Rongai and Ngong?',
    a: 'Simply click "Book a Collection" on our website, select your items or estimated weight, pick your address (Rongai, Ngong, Matasia, Karen, Kiserian, Langata, etc.), and choose a time slot. Our Goldtribe Express rider will arrive with laundry bags to weigh and tag your clothes on the spot.'
  },
  {
    q: 'What is the standard turnaround time for laundry and dry cleaning?',
    a: 'Standard Wash & Fold is 24 hours. Executive Dry Cleaning and Duvet Clinic are 24-48 hours. Carpet cleaning takes 48 hours to ensure complete moisture extraction. We also offer same-day express turnaround for urgent requests!'
  },
  {
    q: 'How do I pay for my laundry order?',
    a: 'We accept M-Pesa (Till / Paybill / STK Push prompt directly on your phone) as well as Cash on Delivery or Card. You can pay when booking online or upon delivery when you inspect your garments.'
  },
  {
    q: 'Are your detergents safe for sensitive skin and baby clothes?',
    a: 'Yes! We use hypoallergenic, bio-degradable, eco-friendly detergents and optional fragrance-free baby-safe rinses. You can specify your detergent preferences during online checkout.'
  },
  {
    q: 'Where are your physical branches located?',
    a: 'Rongai Branch is located at Hill Valley Place Magadi Road (near Magenche). Ngong Branch is located at Country Arcade in Ngong Town. You are welcome to drop off your items directly or request collection!'
  }
];
