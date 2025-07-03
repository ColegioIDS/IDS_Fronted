import { Input } from "@/components/ui/input";
import { ElementType, InputHTMLAttributes } from "react";

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ElementType;
}

export default function IconInput({ icon: Icon, ...props }: IconInputProps) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <Input {...props} className={`pl-9 ${props.className ?? ""}`} />
    </div>
  );
}
