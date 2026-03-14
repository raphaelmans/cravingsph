"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchForm } from "@/features/onboarding/components/branch-form";
import { CompletionStep } from "@/features/onboarding/components/completion-step";
import { MenuBuilderStep } from "@/features/onboarding/components/menu-builder-step";
import { OrganizationForm } from "@/features/onboarding/components/organization-form";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { RestaurantForm } from "@/features/onboarding/components/restaurant-form";
import { WizardProgress } from "@/features/onboarding/components/wizard-progress";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding-status";
import {
  useBranches,
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";

const TOTAL_STEPS = 5;

function StepPrerequisite({
  message,
  onGoBack,
}: {
  message: string;
  onGoBack: () => void;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="size-5 text-warning" />
          </div>
        </div>
        <CardTitle className="text-base">Previous step required</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={onGoBack}>
          <ArrowLeft className="mr-1 size-3.5" />
          Go Back
        </Button>
      </CardContent>
    </Card>
  );
}

function OnboardingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStep = Number(searchParams.get("step") || "1");
  const currentStep = Number.isFinite(rawStep)
    ? Math.max(1, Math.min(Math.round(rawStep), TOTAL_STEPS))
    : 1;

  const { data: organization } = useOrganization();
  const { data: restaurants = [] } = useRestaurants(organization?.id);
  const firstRestaurant = restaurants[0];
  const { data: branches = [] } = useBranches(firstRestaurant?.id);
  const firstBranch = branches[0];

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
      <div className="flex w-full flex-1 flex-col gap-6 p-6 md:p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <AppPageHeader
        variant="compact"
        backHref={appRoutes.organization.getStarted}
        eyebrow="Owner onboarding"
        title="Setup wizard"
        description={`Step ${currentStep} of ${TOTAL_STEPS}. Finish the essentials in one guided flow.`}
      />

      <OwnerWalkthroughPanel
        flowId="owner-onboarding"
        title="Use the setup wizard efficiently"
        description="Complete each stage before advancing."
        steps={[
          {
            title: "Finish the current prerequisite first",
            description: "The wizard enforces step order automatically.",
          },
          {
            title: "Watch the progress row",
            description:
              "See what is complete versus what still needs attention.",
          },
          {
            title: "Return to the hub when you need context",
            description: "Jump to another step or review overall completion.",
          },
        ]}
      />

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
        {currentStep === 2 &&
          (organization ? (
            <RestaurantForm
              organizationId={organization.id}
              onComplete={handleStepComplete}
            />
          ) : (
            <StepPrerequisite
              message="Please complete the organization step first."
              onGoBack={() => goToStep(1)}
            />
          ))}
        {currentStep === 3 &&
          (firstRestaurant ? (
            <BranchForm
              restaurantId={firstRestaurant.id}
              restaurantName={firstRestaurant.name}
              onComplete={handleStepComplete}
            />
          ) : (
            <StepPrerequisite
              message="Please add a restaurant first."
              onGoBack={() => goToStep(2)}
            />
          ))}
        {currentStep === 4 &&
          (firstBranch ? (
            <MenuBuilderStep
              branchId={firstBranch.id}
              onComplete={handleStepComplete}
            />
          ) : (
            <StepPrerequisite
              message="Please add a branch location first."
              onGoBack={() => goToStep(3)}
            />
          ))}
        {currentStep === 5 && (
          <CompletionStep
            allComplete={allComplete}
            completedCount={completedCount}
            totalSteps={totalSteps}
            steps={steps}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={handleBack}>
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
        <div className="flex w-full flex-1 flex-col gap-6 p-6 md:p-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <OnboardingWizardContent />
    </Suspense>
  );
}
