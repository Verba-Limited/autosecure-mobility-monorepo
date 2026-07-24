export type UsedCarCategory = "Sedan" | "SUV" | "Hybrid";

export type UsedCar = {
  id: string;
  brand: string;
  category: UsedCarCategory;
  condition: "Excellent" | "Like New" | "Good";
  dealBadge?: string;
  dealBadgeClassName?: string;
  fuelType: "Petrol" | "Hybrid";
  image: string;
  mileage: string;
  model: string;
  originalPrice?: number;
  price: number;
  statusBadges: string[];
  year: string;
};

export const USED_CAR_FILTERS = [
  "All Makes",
  "Year: Any",
  "Price Range",
  "Mileage: Any",
] as const;

export const USED_CARS: UsedCar[] = [
  {
    id: "mercedes-c-class-c300",
    brand: "Mercedes-Benz",
    category: "Sedan",
    condition: "Excellent",
    dealBadge: "25% Off",
    dealBadgeClassName: "bg-[#EF3D48] text-white",
    fuelType: "Petrol",
    image: "/images/cars/vehicle1.svg",
    mileage: "38,500 km",
    model: "C-Class C300",
    originalPrice: 22_000_000,
    price: 16_500_000,
    statusBadges: ["Certified"],
    year: "2022",
  },
  {
    id: "toyota-camry-xse-v6",
    brand: "Toyota",
    category: "Sedan",
    condition: "Like New",
    fuelType: "Petrol",
    image: "/images/cars/vichicle2.jpg",
    mileage: "18,200 km",
    model: "Camry XSE V6",
    price: 18_900_000,
    statusBadges: ["Certified"],
    year: "2023",
  },
  {
    id: "bmw-x5-xdrive40i",
    brand: "BMW",
    category: "SUV",
    condition: "Good",
    dealBadge: "Hot Deal",
    dealBadgeClassName: "bg-[#F97316] text-white",
    fuelType: "Petrol",
    image: "/images/cars/vichcle3.jpg",
    mileage: "52,100 km",
    model: "X5 xDrive40i",
    originalPrice: 45_000_000,
    price: 36_000_000,
    statusBadges: ["Certified"],
    year: "2021",
  },
  {
    id: "lexus-es-350-f-sport",
    brand: "Lexus",
    category: "Sedan",
    condition: "Excellent",
    fuelType: "Petrol",
    image: "/images/cars/featured-car.jpg",
    mileage: "29,800 km",
    model: "ES 350 F Sport",
    price: 28_500_000,
    statusBadges: ["Certified"],
    year: "2022",
  },
  {
    id: "honda-accord-hybrid",
    brand: "Honda",
    category: "Hybrid",
    condition: "Like New",
    dealBadge: "Hybrid",
    dealBadgeClassName: "bg-[#059669] text-white",
    fuelType: "Hybrid",
    image: "/images/cars/vichcle4.jpg",
    mileage: "12,000 km",
    model: "Accord Hybrid",
    price: 14_500_000,
    statusBadges: ["Certified"],
    year: "2023",
  },
  {
    id: "ford-explorer-platinum",
    brand: "Ford",
    category: "SUV",
    condition: "Good",
    dealBadge: "Tokunbo",
    dealBadgeClassName: "bg-[#2454D6] text-white",
    fuelType: "Petrol",
    image: "/images/cars/vichicle2.jpg",
    mileage: "65,400 km",
    model: "Explorer Platinum",
    originalPrice: 32_000_000,
    price: 24_000_000,
    statusBadges: ["Certified"],
    year: "2020",
  },
];
