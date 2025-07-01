import { FC } from "react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    date: string;
    status: "processed" | "on-hold";
    image: string;
  };
}

const statusColors = {
  processed: "bg-blue-600 dark:bg-blue-500",
  "on-hold": "bg-purple-600 dark:bg-purple-500",
};

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="rounded-xl shadow-md overflow-hidden bg-white dark:bg-gray-800 dark:shadow-gray-900">
      <img 
        src={product.image} 
        alt={product.name} 
        className="h-40 w-full object-cover" 
      />
      <div className="p-4 space-y-2">
        <span className={`text-xs px-2 py-1 text-white rounded-full ${statusColors[product.status]}`}>
          {product.status.replace("-", " ").toUpperCase()}
        </span>
        <h3 className="text-sm font-semibold dark:text-white">{product.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.date}</p>
      </div>
    </div>
  );
};