import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProfileForm } from "@/features/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile details",
};

export default function OwnerProfilePage() {
  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Dashboard", href: appRoutes.organization.base },
          { label: "Profile" },
        ]}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <AppPageHeader
          eyebrow="Owner account"
          title="Profile"
          description="Update your name, email, and contact details."
          icon={<UserRound className="size-5" />}
        />

        <ProfileForm />
      </div>
    </>
  );
}
