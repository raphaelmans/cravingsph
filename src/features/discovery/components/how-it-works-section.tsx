import { ScanLine, ShoppingBag, UtensilsCrossed } from "lucide-react";

const steps = [
  {
    icon: ScanLine,
    title: "Scan QR code",
    description: "Find the QR code on your table or browse restaurants here",
  },
  {
    icon: ShoppingBag,
    title: "Order from your phone",
    description: "Browse the menu, customize items, and place your order",
  },
  {
    icon: UtensilsCrossed,
    title: "Enjoy your meal",
    description: "Your order goes straight to the kitchen — no waiting in line",
  },
];

export function HowItWorksSection() {
  return (
    <section data-slot="how-it-works" className="px-4 py-6">
      <h2 className="mb-4 text-center font-heading text-lg font-bold">
        How it works
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-peach">
              <step.icon className="size-5 text-peach-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Step {index + 1}
            </span>
            <p className="text-sm font-semibold leading-tight">{step.title}</p>
            <p className="text-xs leading-snug text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
