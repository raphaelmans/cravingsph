import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <AppEmptyState
      icon={icon}
      title={title}
      description={description}
      tone="warm"
      className={cn("px-6 py-8", className)}
      primaryAction={
        action ? (
          <Button size="sm" shape="pill" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : undefined
      }
    />
  );
}
