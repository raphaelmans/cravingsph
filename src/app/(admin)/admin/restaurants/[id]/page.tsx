"use client";

import { use } from "react";
import { AdminRestaurantDetailPage } from "@/features/admin/components/admin-restaurant-detail-page";

interface AdminRestaurantDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default function AdminRestaurantDetailRoute({
  params,
}: AdminRestaurantDetailRouteProps) {
  const { id } = use(params);

  return <AdminRestaurantDetailPage restaurantId={id} />;
}
