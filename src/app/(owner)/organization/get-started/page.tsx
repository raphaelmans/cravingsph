import { Rocket } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Button } from "@/components/ui/button";

export default function GetStartedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-orange-100">
        <Rocket className="size-8 text-orange-600" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Set Up Your Restaurant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Complete the setup steps to start accepting orders on cravıngs.
        </p>
      </div>
      <Button asChild>
        <Link href={appRoutes.organization.onboarding}>Start Setup Wizard</Link>
      </Button>
    </div>
  );
}
