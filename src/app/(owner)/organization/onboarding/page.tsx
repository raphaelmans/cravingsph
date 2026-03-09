"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { appRoutes } from "@/common/app-routes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchForm } from "@/features/onboarding/components/branch-form";
import { CompletionStep } from "@/features/onboarding/components/completion-step";
import { MenuBuilderStep } from "@/features/onboarding/components/menu-builder-step";
import { OrganizationForm } from "@/features/onboarding/components/organization-form";
import { PaymentMethodsStep } from "@/features/onboarding/components/payment-methods-step";
import { RestaurantForm } from "@/features/onboarding/components/restaurant-form";
import { VerificationStep } from "@/features/onboarding/components/verification-step";
import { WizardProgress } from "@/features/onboarding/components/wizard-progress";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding-status";
import {
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";

const TOTAL_STEPS = 7;

function OnboardingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const { data: organization } = useOrganization();
  const { data: restaurants = [] } = useRestaurants(organization?.id);
  const firstRestaurant = restaurants[0];

  const { steps, completedCount, totalSteps, isLoading, allComplete } =
    useOnboardingStatus();

  const completedSteps = useMemo(
    () => steps.filter((s) => s.status === "complete").map((s) => s.id),
    [steps],
  );

  const goToStep = (step: number) => {
    const clamped = Math.max(1, Math.min(step, TOTAL_STEPS));
    router.push(`${appRoutes.organization.onboarding}?step=${clamped}`);
  };

  const handleStepComplete = () => {
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    goToStep(currentStep - 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href={appRoutes.organization.getStarted}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to setup hub</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Setup Wizard</h1>
        <span className="text-sm text-muted-foreground ml-auto">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress indicator */}
      <WizardProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Step content */}
      <div>
        {currentStep === 1 && (
          <OrganizationForm
            existingName={organization?.name}
            isComplete={!!organization}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 2 && organization && (
          <RestaurantForm
            organizationId={organization.id}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 3 && firstRestaurant && (
          <BranchForm
            restaurantId={firstRestaurant.id}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 4 && (
          <MenuBuilderStep onComplete={handleStepComplete} />
        )}
        {currentStep === 5 && (
          <PaymentMethodsStep onComplete={handleStepComplete} />
        )}
        {currentStep === 6 && (
          <VerificationStep onComplete={handleStepComplete} />
        )}
        {currentStep === 7 && (
          <CompletionStep
            allComplete={allComplete}
            completedCount={completedCount}
            totalSteps={totalSteps}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 size-3.5" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-2xl mx-auto">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <OnboardingWizardContent />
    </Suspense>
  );
}
