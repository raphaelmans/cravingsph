import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/features/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile details",
};

export default function OwnerProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">
            Update your account details and contact information.
          </p>
          <Link
            href="/organization"
            className="text-primary text-sm hover:underline"
          >
            Back to dashboard
          </Link>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
