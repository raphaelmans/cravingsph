import type { Metadata } from "next";
import { OwnerRegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Register Your Restaurant",
  description:
    "Create an owner account to manage your restaurant on CravingsPH",
};

export default async function OwnerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <OwnerRegisterForm token={token} />;
}
