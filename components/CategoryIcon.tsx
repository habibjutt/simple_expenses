import {
  Utensils, ShoppingCart, ShoppingBag, Car, HeartPulse, Tv,
  GraduationCap, Home, Plane, Sparkles, Repeat, Fuel, Zap,
  Users, Gift, TrendingUp, Landmark, Tag, Banknote, Briefcase,
  ArrowLeftRight, type LucideProps,
} from "lucide-react";
import { type ComponentType } from "react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  utensils: Utensils,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  car: Car,
  "heart-pulse": HeartPulse,
  tv: Tv,
  "graduation-cap": GraduationCap,
  home: Home,
  plane: Plane,
  sparkles: Sparkles,
  repeat: Repeat,
  fuel: Fuel,
  zap: Zap,
  users: Users,
  gift: Gift,
  "trending-up": TrendingUp,
  landmark: Landmark,
  tag: Tag,
  banknote: Banknote,
  briefcase: Briefcase,
  "arrow-left-right": ArrowLeftRight,
};

export function CategoryIcon({
  icon,
  className,
  color,
}: {
  icon: string;
  className?: string;
  color?: string;
}) {
  const Icon = iconMap[icon] ?? Tag;
  return <Icon className={className} color={color} />;
}
