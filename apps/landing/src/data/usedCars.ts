export type UsedCarCategory = "Sedan" | "SUV" | "Hybrid";

export const USED_CAR_FILTERS = [
  "All",
  "Hybrid",
  "Sedan",
  "SUV",
  "Under ₦35m",
  "Luxury",
] as const;

export type UsedCar = {
  id: string;
  brand: string;
  category: UsedCarCategory;
  condition: "Excellent" | "Like New" | "Good";
  dealBadge?: string;
  dealBadgeClassName?: string;
  fuelType: string;
  bodyType?: string;
  driveType?: string;
  transmission?: string;
  seatingCapacity?: number;
  countryOfOrigin?: string;
  image: string;
  mileage: string;
  model: string;
  colors?: { name: string; hex: string }[];
  originalPrice?: number;
  price: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  priceRange: string;
  statusBadges: string[];
  year: string;
};

export const USED_CARS: UsedCar[] = [
  {
    id: "mercedes-c-class-c300",
    brand: "Mercedes-Benz",
    category: "Sedan",
    condition: "Excellent",
    dealBadge: "Certified Deal",
    dealBadgeClassName: "border border-red-500/25 bg-red-500/10 text-red-400",
    fuelType: "Petrol",
    bodyType: "Sedan",
    driveType: "RWD",
    transmission: "Automatic",
    seatingCapacity: 5,
    countryOfOrigin: "Germany",
    image: "/images/cars/vehicle1.svg",
    mileage: "38,500 km",
    model: "C-Class C300",
    colors: [
      { name: "Polar White", hex: "#f8f9fa" },
      { name: "Obsidian Black", hex: "#111214" },
    ],
    originalPrice: 22_000_000,
    price: 16_500_000,
    priceRangeMin: 15_500_000,
    priceRangeMax: 18_000_000,
    priceRange: "₦15.5 million – ₦18 million",
    statusBadges: ["Certified"],
    year: "2022",
  },
  {
    id: "toyota-camry-xse-v6",
    brand: "Toyota",
    category: "Sedan",
    condition: "Like New",
    fuelType: "Petrol",
    bodyType: "Sedan",
    driveType: "FWD",
    transmission: "Automatic",
    seatingCapacity: 5,
    countryOfOrigin: "Japan",
    image: "/images/cars/vichicle2.jpg",
    mileage: "18,200 km",
    model: "Camry XSE V6",
    colors: [
      { name: "Wind Chill Pearl", hex: "#f3f4f6" },
      { name: "Midnight Black", hex: "#0e0f11" },
    ],
    price: 18_900_000,
    priceRangeMin: 18_000_000,
    priceRangeMax: 21_000_000,
    priceRange: "₦18 million – ₦21 million",
    statusBadges: ["Certified"],
    year: "2023",
  },
  {
    id: "bmw-x5-xdrive40i",
    brand: "BMW",
    category: "SUV",
    condition: "Good",
    dealBadge: "Hot Deal",
    dealBadgeClassName: "border border-amber-500/25 bg-amber-500/10 text-amber-400",
    fuelType: "Petrol",
    bodyType: "SUV",
    driveType: "AWD / 4WD",
    transmission: "Automatic",
    seatingCapacity: 5,
    countryOfOrigin: "Germany",
    image: "/images/cars/vichcle3.jpg",
    mileage: "52,100 km",
    model: "X5 xDrive40i",
    colors: [
      { name: "Mineral White", hex: "#f0f2f5" },
      { name: "Carbon Black", hex: "#0b0c0e" },
    ],
    originalPrice: 45_000_000,
    price: 36_000_000,
    priceRangeMin: 34_000_000,
    priceRangeMax: 39_000_000,
    priceRange: "₦34 million – ₦39 million",
    statusBadges: ["Certified"],
    year: "2021",
  },
  {
    id: "lexus-es-350-f-sport",
    brand: "Lexus",
    category: "Sedan",
    condition: "Excellent",
    fuelType: "Petrol",
    bodyType: "Sedan",
    driveType: "FWD",
    transmission: "Automatic",
    seatingCapacity: 5,
    countryOfOrigin: "Japan",
    image: "/images/cars/featured-car.jpg",
    mileage: "29,800 km",
    model: "ES 350 F Sport",
    colors: [
      { name: "Caviar Black", hex: "#111214" },
      { name: "Atomic Silver", hex: "#a8adb5" },
    ],
    price: 28_500_000,
    priceRangeMin: 27_000_000,
    priceRangeMax: 31_000_000,
    priceRange: "₦27 million – ₦31 million",
    statusBadges: ["Certified"],
    year: "2022",
  },
  {
    id: "honda-accord-hybrid",
    brand: "Honda",
    category: "Hybrid",
    condition: "Like New",
    dealBadge: "Hybrid",
    dealBadgeClassName: "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    fuelType: "Hybrid",
    bodyType: "Sedan",
    driveType: "FWD",
    transmission: "Automatic",
    seatingCapacity: 5,
    countryOfOrigin: "Japan",
    image: "/images/cars/vichcle4.jpg",
    mileage: "12,000 km",
    model: "Accord Hybrid Touring",
    colors: [
      { name: "Platinum White", hex: "#f8f9fa" },
      { name: "Crystal Black", hex: "#0d0e10" },
    ],
    price: 14_500_000,
    priceRangeMin: 14_000_000,
    priceRangeMax: 17_000_000,
    priceRange: "₦14 million – ₦17 million",
    statusBadges: ["Certified"],
    year: "2023",
  },
  {
    id: "ford-explorer-platinum",
    brand: "Ford",
    category: "SUV",
    condition: "Good",
    dealBadge: "Verified",
    dealBadgeClassName: "border border-blue-500/25 bg-blue-500/10 text-blue-400",
    fuelType: "Petrol",
    bodyType: "SUV",
    driveType: "AWD / 4WD",
    transmission: "Automatic",
    seatingCapacity: 7,
    countryOfOrigin: "USA",
    image: "/images/cars/vichicle2.jpg",
    mileage: "65,400 km",
    model: "Explorer Platinum 7-Seat",
    colors: [
      { name: "Agate Black", hex: "#0f1012" },
      { name: "Star White", hex: "#f5f6f8" },
    ],
    originalPrice: 32_000_000,
    price: 24_000_000,
    priceRangeMin: 23_000_000,
    priceRangeMax: 27_000_000,
    priceRange: "₦23 million – ₦27 million",
    statusBadges: ["Certified"],
    year: "2020",
  },
];
