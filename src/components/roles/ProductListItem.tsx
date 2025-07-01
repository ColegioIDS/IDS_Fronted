import { FC } from "react";

interface ProductListItemProps {
  product: {
    id: number;
    name: string;
    date: string;
    status: "processed" | "on-hold";
    image: string;
  };
}

export const ProductListItem: FC<ProductListItemProps> = ({ product }) => {
  return (
    <div className="flex items-center gap-4 bg-white shadow-sm p-4 rounded-xl">
      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.date}</p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full text-white ${
          product.status === "processed" ? "bg-blue-600" : "bg-purple-600"
        }`}
      >
        {product.status.replace("-", " ").toUpperCase()}
      </span>
    </div>
  );
};
