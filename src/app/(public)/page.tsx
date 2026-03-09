import { Logo } from "@/components/brand/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-peach px-6">
      <Logo size="xl" />
      <p className="mt-4 text-lg text-peach-foreground">
        Craving for something?
      </p>
    </main>
  );
}
