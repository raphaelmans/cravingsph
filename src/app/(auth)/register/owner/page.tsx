import type { Metadata } from "next";
import { OwnerRegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Register Your Restaurant",
  description:
    "Create an owner account to manage your restaurant on CravingsPH",
};

export default function OwnerRegisterPage() {
  return <OwnerRegisterForm />;
}
