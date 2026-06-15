export interface Movie {
  id: string;
  title: string;
  poster: string;
  banner: string;
  rating: number;
  votes: string;
  likes?: string;
  genre: string[];
  duration: string; // e.g., "2h 45m"
  language: string[];
  certificate: 'U' | 'UA' | 'A' | 'PG-13' | 'R';
  format: ('2D' | '3D' | 'IMAX 2D' | 'IMAX 3D')[];
  description: string;
  releaseDate: string;
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  distance?: string;
  amenities: ('M-Ticket' | 'Food & Beverage' | 'Recliner Seats' | 'Dolby Atmos')[];
  showtimes: {
    id: string;
    time: string;
    format: '2D' | '3D' | 'IMAX 2D' | 'IMAX 3D';
    priceRange: string;
    basePrice: number;
  }[];
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: 'Snacks' | 'Drinks' | 'Combos';
  image: string;
  description: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  category: 'Comedy Shows' | 'Music Shows' | 'Amusement Park' | 'Kids' | 'Art & Crafts' | 'Theatre & Plays' | 'Sports';
  image: string;
  date: string;
  venue: string;
  price: number;
  likes?: string;
  promoted?: boolean;
}

export interface Booking {
  id: string;
  movie?: Movie;
  event?: LiveEvent;
  theatreName?: string;
  showtime?: string;
  showDate: string;
  seats: string[];
  foodItems: { item: FoodItem; quantity: number }[];
  totalPrice: number;
  bookingTime: string;
  qrCodeValue: string;
  ticketStatus: 'Active' | 'Cancelled';
}

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface UserAccount {
  name: string;
  email: string;
  phoneNumber: string; // must start with +91 and contain 10 subsequent digits
  password?: string;
  balance: number;
}
