export type CarCategory = "Sedan" | "SUV" | "Sports" | "Electric" | "Truck";

export type Car = {
  id: string;
  brand: string;
  model: string;
  category: CarCategory;
  /** Badge shown top-left on the image (e.g. "New 2025", "Electric") */
  badgeLabel: string;
  hasVideo: boolean;
  image: string;
  specs: { label: string; value: string }[];
  price: number;
  imageLabel: string;
};

export const CARS: Car[] = [
  {
    id: "bmw-5-series-530i",
    brand: "BMW",
    model: "5 Series 530i",
    category: "Sedan",
    badgeLabel: "New 2025",
    hasVideo: true,
    image: "/images/cars/vichicle2.jpg",
    specs: [
      { label: "Power", value: "248hp" },
      { label: "0-100 km/h", value: "6.1s" },
      { label: "Gearbox", value: "Auto 8-Spd" },
    ],
    price: 45_000_000,
    imageLabel: "BMW 5 Series 530i — rear 3/4 shot",
  },
  {
    id: "land-rover-range-rover-sport",
    brand: "Land Rover",
    model: "Range Rover Sport",
    category: "SUV",
    badgeLabel: "New 2025",
    hasVideo: true,
    image: "/images/cars/vichcle3.jpg",
    specs: [
      { label: "Power", value: "395hp" },
      { label: "0-100 km/h", value: "5.4s" },
      { label: "Gearbox", value: "Auto 8-Spd" },
    ],
    price: 78_500_000,
    imageLabel: "Range Rover Sport — front, mountain backdrop",
  },
  {
    id: "porsche-cayenne-gts",
    brand: "Porsche",
    model: "Cayenne GTS",
    category: "Sports",
    badgeLabel: "New 2025",
    hasVideo: true,
    image: "/images/cars/vichcle4.jpg",
    specs: [
      { label: "Power", value: "460hp" },
      { label: "0-100 km/h", value: "4.5s" },
      { label: "Gearbox", value: "PDK 8-Spd" },
    ],
    price: 120_000_000,
    imageLabel: "Porsche Cayenne GTS — side profile, autumn backdrop",
  },
  {
    id: "tesla-model-s-plaid",
    brand: "Tesla",
    model: "Model S Plaid",
    category: "Electric",
    badgeLabel: "Electric",
    hasVideo: true,
    image: "/images/cars/featured-car.jpg",
    specs: [
      { label: "Power", value: "1,020hp" },
      { label: "0-100 km/h", value: "2.1s" },
      { label: "Range", value: "637 km" },
    ],
    price: 95_000_000,
    imageLabel: "Tesla Model S Plaid — front 3/4 shot",
  },
  {
    id: "mercedes-gle-450-amg",
    brand: "Mercedes-Benz",
    model: "GLE 450 AMG",
    category: "SUV",
    badgeLabel: "New 2025",
    hasVideo: true,
    image: "/images/cars/vehicle1.svg",
    specs: [
      { label: "Power", value: "367hp" },
      { label: "0-100 km/h", value: "5.7s" },
      { label: "Gearbox", value: "9G-Tronic" },
    ],
    price: 85_000_000,
    imageLabel: "Mercedes-Benz GLE 450 AMG — front, dealership forecourt",
  },
  {
    id: "toyota-land-cruiser-300",
    brand: "Toyota",
    model: "Land Cruiser 300",
    category: "Truck",
    badgeLabel: "New 2025",
    hasVideo: true,
    image: "/images/cars/vehicle1.svg",
    specs: [
      { label: "Power", value: "415hp" },
      { label: "0-100 km/h", value: "6.7s" },
      { label: "Gearbox", value: "10-Spd Auto" },
    ],
    price: 55_000_000,
    imageLabel: "Toyota Land Cruiser 300 — front, dealership forecourt",
  },
];
