import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CuisineOption {
  label: string;
  emoji: string;
  slug: string;
}

interface CuisinePillProps {
  cuisine: CuisineOption;
}

export function CuisinePill({ cuisine }: CuisinePillProps) {
  return (
    <Button
      asChild
      variant="outline"
      shape="pill"
      size="sm"
      className="shrink-0 gap-2"
    >
      <Link href={`/search?cuisine=${encodeURIComponent(cuisine.slug)}`}>
        <span aria-hidden="true">{cuisine.emoji}</span>
        {cuisine.label}
      </Link>
    </Button>
  );
}

export const CUISINE_OPTIONS: CuisineOption[] = [
  { label: "Filipino", emoji: "\ud83c\uddf5\ud83c\udded", slug: "filipino" },
  { label: "Chicken", emoji: "\ud83c\udf57", slug: "chicken" },
  { label: "Rice Meals", emoji: "\ud83c\udf5a", slug: "rice-meals" },
  { label: "Seafood", emoji: "\ud83e\udd90", slug: "seafood" },
  { label: "BBQ", emoji: "\ud83c\udf56", slug: "bbq" },
  { label: "Desserts", emoji: "\ud83c\udf67", slug: "desserts" },
  { label: "Coffee", emoji: "\u2615", slug: "coffee" },
  { label: "Milk Tea", emoji: "\ud83e\uddc3", slug: "milk-tea" },
  { label: "Street Food", emoji: "\ud83c\udf62", slug: "street-food" },
  { label: "Burgers", emoji: "\ud83c\udf54", slug: "burgers" },
];
