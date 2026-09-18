export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  condition: string;
  age: string;
  city: string;
  seller: string;
  score: number;
  image: string;
  description: string;
};

export type Partner = {
  id: number;
  name: string;
  type: "repair" | "ngo" | "recycler";
  location: string;
  rating: number;
  jobs: number;
  image: string;
  description: string;
  tags: string[];
};
