import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageLoading() {
  return (
    <Card aria-busy="true" aria-live="polite" className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-4 w-56 rounded-full" />
      </CardHeader>
      {/* Mirrors form(flex flex-col gap-6) wrapping CardContent + CardFooter */}
      <div className="flex flex-col gap-6">
        <CardContent className="space-y-4">
          {/* Google sign-in button */}
          <Skeleton className="h-11 w-full rounded-lg" />
          {/* Separator */}
          <Skeleton className="h-px w-full" />
          {/* Email field: label + input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          {/* Password field: label + input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Submit button */}
          <Skeleton className="h-10 w-full rounded-lg" />
          {/* "Don't have an account? Sign up" */}
          <Skeleton className="mx-auto h-4 w-48 rounded-full" />
          {/* "Sign in with magic link" */}
          <Skeleton className="mx-auto h-4 w-36 rounded-full" />
        </CardFooter>
      </div>
    </Card>
  );
}
