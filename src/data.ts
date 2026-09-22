import type { Product, Partner } from "./types";

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 13",
    category: "Mobile",
    brand: "Apple",
    price: 28900,
    originalPrice: 59900,
    condition: "Excellent",
    age: "2 years",
    city: "Mumbai",
    seller: "Rohan Mehta",
    score: 92,
    image:
      "https://images.unsplash.com/photo-1592286927505-6d4c7d2d3f1a?auto=format&fit=crop&w=1000&q=85",
    description:
      "Well maintained iPhone with original accessories and strong battery health."
  },
  {
    id: 2,
    name: "Galaxy S23",
    category: "Mobile",
    brand: "Samsung",
    price: 31900,
    originalPrice: 74999,
    condition: "Very Good",
    age: "1.5 years",
    city: "Pune",
    seller: "Meera Shah",
    score: 89,
    image:
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=1000&q=85",
    description:
      "Clean Galaxy S23 with box and charging cable."
  },
  {
    id: 3,
    name: "MacBook Air M1",
    category: "Laptop",
    brand: "Apple",
    price: 52900,
    originalPrice: 92900,
    condition: "Excellent",
    age: "2 years",
    city: "Bengaluru",
    seller: "Aarav Rao",
    score: 95,
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
    description:
      "M1 MacBook Air in excellent condition, ideal for students and creators."
  },
  {
    id: 4,
    name: "Dell Inspiron 14",
    category: "Laptop",
    brand: "Dell",
    price: 18900,
    originalPrice: 55000,
    condition: "Good",
    age: "4 years",
    city: "Mumbai",
    seller: "Aanya",
    score: 87,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=85",
    description:
      "Reliable everyday laptop. Battery health 76%. Great candidate for repair."
  },
  {
    id: 5,
    name: "iPad Air",
    category: "Tablet",
    brand: "Apple",
    price: 25900,
    originalPrice: 54900,
    condition: "Very Good",
    age: "2 years",
    city: "Thane",
    seller: "Ishita Kulkarni",
    score: 91,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
    description:
      "Lightly used iPad Air with protective case and charger."
  },
  {
    id: 6,
    name: "Sony WH-1000XM4",
    category: "Audio",
    brand: "Sony",
    price: 12900,
    originalPrice: 29990,
    condition: "Excellent",
    age: "2 years",
    city: "Delhi",
    seller: "Kabir Jain",
    score: 88,
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1000&q=85",
    description:
      "Premium noise cancelling headphones with carrying case."
  },
  {
    id: 7,
    name: "Canon EOS 200D",
    category: "Camera",
    brand: "Canon",
    price: 31900,
    originalPrice: 55990,
    condition: "Very Good",
    age: "3 years",
    city: "Mumbai",
    seller: "Neel Patil",
    score: 86,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
    description:
      "Compact DSLR with kit lens and low shutter count."
  },
  {
    id: 8,
    name: "Nintendo Switch OLED",
    category: "Gaming Console",
    brand: "Nintendo",
    price: 23900,
    originalPrice: 34990,
    condition: "Excellent",
    age: "1 year",
    city: "Nashik",
    seller: "Vivaan Shah",
    score: 90,
    image:
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1000&q=85",
    description:
      "OLED model in excellent condition with dock and controllers."
  }
];

export const partners: Partner[] = [
  {
    id: 1,
    name: "FixIt Studio",
    type: "repair",
    location: "Andheri, Mumbai",
    rating: 4.9,
    jobs: 1240,
    image:
      "https://images.unsplash.com/photo-1581091870622-3c8e4f0b2c5a?auto=format&fit=crop&w=1000&q=85",
    description:
      "Trusted local electronics repair studio specialising in laptops, phones and tablets.",
    tags: ["Laptop", "Phone", "Tablet"]
  },
  {
    id: 2,
    name: "Reboot Works",
    type: "repair",
    location: "Baner, Pune",
    rating: 4.8,
    jobs: 860,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85",
    description:
      "Device diagnostics, battery replacement and board-level repair.",
    tags: ["Laptop", "Phone", "Tablet"]
  },
  {
    id: 3,
    name: "TechCare Hub",
    type: "repair",
    location: "Indiranagar, Bengaluru",
    rating: 4.7,
    jobs: 730,
    image:
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=85",
    description:
      "Same-week repair support for personal electronics and gaming devices.",
    tags: ["Laptop", "Gaming", "Audio"]
  },
  {
    id: 4,
    name: "Udaan Foundation",
    type: "ngo",
    location: "Mumbai",
    rating: 4.9,
    jobs: 3420,
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=85",
    description:
      "Connects useful electronics, books and learning resources with community programs.",
    tags: ["Electronics", "Books", "Education"]
  },
  {
    id: 5,
    name: "SecondStart Trust",
    type: "ngo",
    location: "Pune",
    rating: 4.8,
    jobs: 2190,
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85",
    description:
      "Supports families through essential household and educational donations.",
    tags: ["Appliances", "Furniture", "Books"]
  },
  {
    id: 6,
    name: "ReCircle Certified",
    type: "recycler",
    location: "Vasai, Maharashtra",
    rating: 4.9,
    jobs: 5100,
    image:
      "https://www.abhyuthanamind.com/build/assets/recycle-1-CSYsDA6r.jpg",
    description:
      "Certified collection and responsible material recovery for electronics.",
    tags: ["E-waste", "Batteries", "Cables"]
  }
];