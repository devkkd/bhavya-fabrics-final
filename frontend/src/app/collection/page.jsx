import { redirect } from "next/navigation";
import { categories } from "../data/product";

const FALLBACK_CATEGORIES = categories || [];

export default function CollectionIndexPage() {
  const firstCategory = FALLBACK_CATEGORIES[0];

  if (!firstCategory) {
    return null;
  }

  redirect(`/collection/${firstCategory.id || firstCategory.slug || "cotton"}`);
}