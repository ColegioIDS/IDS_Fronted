"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import { FaThLarge, FaList } from "react-icons/fa";

type ProductStatus = "processed" | "on-hold";

interface Product {
  id: number;
  name: string;
  date: string;
  status: ProductStatus;
  image: string;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Chocolate Cake",
    date: "21.12.2022",
    status: "processed",
    image: "/images/cake.jpg",
  },
  {
    id: 2,
    name: "Cheesecake",
    date: "25.12.2022",
    status: "on-hold",
    image: "/images/cheesecake.jpg",
  },
  {
    id: 3,
    name: "Cremschnitte",
    date: "19.12.2022",
    status: "on-hold",
    image: "/images/cremschnitte.jpg",
  },
];
 const ProductListToggle = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded ${view === "grid" ? "bg-gray-200" : ""}`}
          >
            <FaThLarge />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${view === "list" ? "bg-gray-200" : ""}`}
          >
            <FaList />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sampleProducts.map((p) => (
            <ProductListItem key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListToggle;
