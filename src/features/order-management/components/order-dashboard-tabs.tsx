"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderRecord, OrderTab } from "../types";
import { TAB_STATUS_MAP } from "../types";
import { OrderRow } from "./order-row";

interface OrderDashboardTabsProps {
  orders: OrderRecord[];
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  /** Base URL for order detail links (orderId will be appended) */
  detailBaseHref: string;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

const TABS: { value: OrderTab; label: string }[] = [
  { value: "inbox", label: "Inbox" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function filterByTab(orders: OrderRecord[], tab: OrderTab): OrderRecord[] {
  const statuses = TAB_STATUS_MAP[tab];
  return orders.filter((o) => statuses.includes(o.status));
}

export function OrderDashboardTabs({
  orders,
  activeTab,
  onTabChange,
  detailBaseHref,
  onAccept,
  onReject,
}: OrderDashboardTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as OrderTab)}
      data-slot="order-dashboard-tabs"
    >
      <TabsList>
        {TABS.map((tab) => {
          const count = filterByTab(orders, tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
              {count > 0 && (
                <Badge
                  variant={tab.value === "inbox" ? "default" : "secondary"}
                  className="h-5 min-w-5 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TABS.map((tab) => {
        const filtered = filterByTab(orders, tab.value);
        return (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No {tab.label.toLowerCase()} orders
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    detailHref={`${detailBaseHref}/${order.id}`}
                    onAccept={tab.value === "inbox" ? onAccept : undefined}
                    onReject={tab.value === "inbox" ? onReject : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
