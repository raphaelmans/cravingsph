import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-svh items-center justify-center bg-gradient-to-b from-peach/60 via-background to-background px-4 py-10"
    >
      <Card className="w-full max-w-md border-white/60 bg-background/95 shadow-lg backdrop-blur">
        <CardHeader className="items-center space-y-4 text-center">
          <Logo size="lg" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-6 w-40 rounded-full" />
            <Skeleton className="mx-auto h-4 w-56 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </CardContent>
      </Card>
    </main>
  );
}
