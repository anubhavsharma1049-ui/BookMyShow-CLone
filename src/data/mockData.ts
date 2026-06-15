import { Movie, Theatre, FoodItem, LiveEvent, City } from '../types';

export const CITIES: City[] = [
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
];

export const MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Oye Bhole Oye 2',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
    rating: 9.6,
    votes: '2.4K',
    genre: ['Comedy', 'Drama', 'Regional'],
    duration: '2h 15m',
    language: ['Punjabi', 'Hindi'],
    certificate: 'UA',
    format: ['2D'],
    description: 'A hilarious sequel focusing on the whimsical cultural disputes of a loving village bumpkin who travels to the city, only to discover his simple ideals don’t match modern high-tech living.',
    releaseDate: '12th Jun 2026',
  },
  {
    id: 'm2',
    title: 'Cocktail 2: Island Night',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1200',
    rating: 8.4,
    votes: '4.8K',
    likes: '62K Likes',
    genre: ['Comedy', 'Romance', 'Musical'],
    duration: '2h 30m',
    language: ['Hindi', 'English'],
    certificate: 'A',
    format: ['2D', '3D'],
    description: 'Three friends reunite in Greece for an unpredictable seaside wedding, sparking unresolved romantic feelings, dynamic club-hop dance battles, and a comedic roller-coaster of loyalty tests.',
    releaseDate: '14th Jun 2026',
  },
  {
    id: 'm3',
    title: 'Haunted Echoes 3D',
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=1200',
    rating: 7.8,
    votes: '14.8K',
    genre: ['Horror', 'Mystery', 'Thriller'],
    duration: '2h 10m',
    language: ['English', 'Hindi', 'Telugu'],
    certificate: 'A',
    format: ['3D', 'IMAX 3D'],
    description: 'In an ancient, fog-shielded estate, an archaeologist accidentally activates a sonic device that channels spirits from the past, turning normal sounds into survival-threatening horrors.',
    releaseDate: '10th Jun 2026',
  },
  {
    id: 'm4',
    title: 'Main Vaapas Aaunga',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200',
    rating: 8.9,
    votes: '2.6K',
    genre: ['Drama', 'Period', 'Romantic'],
    duration: '2h 45m',
    language: ['Hindi', 'Punjabi'],
    certificate: 'UA',
    format: ['2D'],
    description: 'An emotional saga of separation and deep hope spanning two decades. A determined young man navigates political upheavals and hard-won paths to return to his homeland, reclaiming his ancestral soil.',
    releaseDate: '5th Jun 2026',
  },
  {
    id: 'm5',
    title: 'Hai Jawani Toh Ishq Hona Hai',
    poster: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
    rating: 8.1,
    votes: '24.9K',
    genre: ['Romance', 'Musical', 'Family'],
    duration: '2h 38m',
    language: ['Hindi'],
    certificate: 'U',
    format: ['2D'],
    description: 'A charming modern romance showcasing two high-spirited architecture students. They discover life, love, and professional rivalries over festive seasons in historic Rajasthan.',
    releaseDate: '8th Jun 2026',
  },
  {
    id: 'm6',
    title: 'The Cyber Reconnaissance',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=500',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
    rating: 9.2,
    votes: '11.1K',
    genre: ['Sci-Fi', 'Thriller', 'Action'],
    duration: '2h 22m',
    language: ['English', 'Hindi', 'Tamil'],
    certificate: 'UA',
    format: ['2D', 'IMAX 2D'],
    description: 'When self-replicating artificial quantum cores start rewriting satellite communication protocols, an isolated code breaker must hack into a central subterranean mainframe before cities dim.',
    releaseDate: '20th Jun 2026',
  }
];

export const THEATRES: Theatre[] = [
  {
    id: 't1',
    name: 'PVR: Elante Mall, Chandigarh',
    location: 'Industrial Area Phase 1, Chandigarh',
    distance: '1.8 km away',
    amenities: ['M-Ticket', 'Food & Beverage', 'Recliner Seats', 'Dolby Atmos'],
    showtimes: [
      { id: 's1-1', time: '10:15 AM', format: '2D', priceRange: '₹180 - ₹350', basePrice: 200 },
      { id: 's1-2', time: '01:30 PM', format: '2D', priceRange: '₹220 - ₹400', basePrice: 230 },
      { id: 's1-3', time: '04:45 PM', format: '3D', priceRange: '₹250 - ₹450', basePrice: 280 },
      { id: 's1-4', time: '07:45 PM', format: '2D', priceRange: '₹280 - ₹500', basePrice: 320 },
      { id: 's1-5', time: '10:45 PM', format: '2D', priceRange: '₹200 - ₹380', basePrice: 220 },
    ]
  },
  {
    id: 't2',
    name: 'Piccadily Square: Sector 34',
    location: 'Sector 34-A, Chandigarh',
    distance: '3.1 km away',
    amenities: ['M-Ticket', 'Food & Beverage', 'Dolby Atmos'],
    showtimes: [
      { id: 's2-1', time: '11:00 AM', format: '2D', priceRange: '₹140 - ₹280', basePrice: 150 },
      { id: 's2-2', time: '02:00 PM', format: '2D', priceRange: '₹160 - ₹300', basePrice: 170 },
      { id: 's2-3', time: '05:15 PM', format: '2D', priceRange: '₹180 - ₹340', basePrice: 200 },
      { id: 's2-4', time: '08:30 PM', format: '2D', priceRange: '₹220 - ₹380', basePrice: 240 },
    ]
  },
  {
    id: 't3',
    name: 'Cinepolis: TDI Mall, Sector 17',
    location: 'Sector 17, Chandigarh',
    distance: '4.5 km away',
    amenities: ['M-Ticket', 'Food & Beverage', 'Recliner Seats'],
    showtimes: [
      { id: 's3-1', time: '09:30 AM', format: '2D', priceRange: '₹150 - ₹300', basePrice: 160 },
      { id: 's3-2', time: '12:45 PM', format: '3D', priceRange: '₹220 - ₹420', basePrice: 240 },
      { id: 's3-3', time: '03:45 PM', format: '2D', priceRange: '₹180 - ₹320', basePrice: 190 },
      { id: 's3-4', time: '06:50 PM', format: '2D', priceRange: '₹250 - ₹450', basePrice: 270 },
      { id: 's3-5', time: '10:00 PM', format: '3D', priceRange: '₹220 - ₹390', basePrice: 230 },
    ]
  },
  {
    id: 't4',
    name: 'Rajhans Cinemas: Zirakpur VIP Road',
    location: 'VIP Road, Zirakpur',
    distance: '8.2 km away',
    amenities: ['M-Ticket', 'Food & Beverage'],
    showtimes: [
      { id: 's4-1', time: '12:00 PM', format: '2D', priceRange: '₹120 - ₹240', basePrice: 130 },
      { id: 's4-2', time: '03:15 PM', format: '2D', priceRange: '₹140 - ₹280', basePrice: 150 },
      { id: 's4-3', time: '06:30 PM', format: '2D', priceRange: '₹160 - ₹320', basePrice: 180 },
      { id: 's4-4', time: '09:45 PM', format: '2D', priceRange: '₹180 - ₹350', basePrice: 200 },
    ]
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'f1',
    name: 'Salted Popcorn (Medium)',
    price: 190,
    category: 'Snacks',
    image: '🍿',
    description: 'Freshly popped, salted premium corn kernels with warm natural oil sprinkle.'
  },
  {
    id: 'f2',
    name: 'Caramel & Butter Popcorn Tub',
    price: 320,
    category: 'Snacks',
    image: '🍿',
    description: 'Gigantic dual-flavor hand-crafted tub containing premium caramel shell & heavy melted butter styles.'
  },
  {
    id: 'f3',
    name: 'Coca-Cola (Large 500ml)',
    price: 140,
    category: 'Drinks',
    image: '🥤',
    description: 'Chilled carbonated classic cola served with ice cubes.'
  },
  {
    id: 'f4',
    name: 'Mountain Dew Cup (350ml)',
    price: 120,
    category: 'Drinks',
    image: '🥤',
    description: 'Crisp, citrus neon soda to fuel high energy suspense.'
  },
  {
    id: 'f5',
    name: 'Blockbuster Duo Combo',
    price: 490,
    category: 'Combos',
    image: '🍿🥤',
    description: '1 Large Tub Popcorn (Salted) + 2 Large Coca-Cola Cups. Save up to 15%!'
  },
  {
    id: 'f6',
    name: 'Crunchy Nachos & Salsa Dip',
    price: 210,
    category: 'Snacks',
    image: '🌮',
    description: 'Stone-ground crispy yellow corn triangles served with warm cheddar cheese dip and tangy tomato herb salsa.'
  }
];

export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: 'e1',
    title: 'The Laugh Riot: Zakir Khan Live',
    category: 'Comedy Shows',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?auto=format&fit=crop&q=80&w=500',
    date: 'Sat, 29 Aug Onwards',
    venue: 'Tagore Theatre, Sector 18, Chandigarh',
    price: 499,
    likes: '12K Likes',
    promoted: true
  },
  {
    id: 'e2',
    title: 'Funcity Water & Amusement Park',
    category: 'Amusement Park',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=500',
    date: 'Tue, 16 Jun Onwards',
    venue: 'Surya Funcity Water Park, Ramgarh',
    price: 1200,
    likes: '18K Likes'
  },
  {
    id: 'e3',
    title: 'Jasmine Sandlas: The Dream Tour',
    category: 'Music Shows',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=500',
    date: 'Sat, 15 Aug Onwards',
    venue: 'Exhibition Ground, Sector 34, Chandigarh',
    price: 799,
    promoted: true
  },
  {
    id: 'e4',
    title: 'Foo Fighters Tribute: India Concert',
    category: 'Music Shows',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=500',
    date: 'Fri, 29 Jan Onwards',
    venue: 'VIP Club Gigs, Mohali',
    price: 999,
    promoted: true
  },
  {
    id: 'e5',
    title: 'Imagicaa Theme Park: Adventure Pass',
    category: 'Amusement Park',
    image: 'https://images.unsplash.com/photo-1513885531473-acb146430b60?auto=format&fit=crop&q=80&w=500',
    date: 'Daily Pass',
    venue: 'Khopoli, Mumbai-Pune HQ',
    price: 1499,
    likes: '82K Likes'
  },
  {
    id: 'e6',
    title: 'Sky Jumper Trampoline Park Arena',
    category: 'Kids',
    image: 'https://images.unsplash.com/photo-1561525140-c2a4cc68e2db?auto=format&fit=crop&q=80&w=500',
    date: 'Mon, 15 Jun Onwards',
    venue: 'Elante mall Level 3, Chandigarh',
    price: 650,
    likes: '5K Likes'
  },
  {
    id: 'e7',
    title: 'Art & Pottery Fusion Craft Show',
    category: 'Art & Crafts',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=500',
    date: 'Wed, 17 Jun Onwards',
    venue: 'Alliance Francaise, Sector 36',
    price: 350
  }
];

export const BANNER_SLIDES = [
  {
    id: 'slide1',
    title: 'BookMyTheatre Streams: The Demoness',
    subtitle: 'Buy or Rent Online • Get 20% cashback up to ₹100',
    buttonText: 'Buy/Rent Online',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
    color: 'from-purple-950 via-slate-900 to-indigo-950'
  },
  {
    id: 'slide2',
    title: 'Live Music Arena Tour featuring Foo Fighters Hub',
    subtitle: 'Tickets starting at just ₹999. Get Flat 50% off with pop Cards!',
    buttonText: 'Book Tickets Now',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    color: 'from-orange-950 via-slate-900 to-amber-950'
  },
  {
    id: 'slide3',
    title: 'Endless Family Entertainment. Anytime. Anywhere!',
    subtitle: 'Stream over 40+ independent regional plays and music awards.',
    buttonText: 'Explore Collection',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1200',
    color: 'from-emerald-950 via-slate-900 to-teal-950'
  }
];
