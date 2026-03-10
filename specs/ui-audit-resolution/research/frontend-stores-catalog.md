# Frontend Local Stores Requiring Backend Replacement

## 8 Hooks to Replace

### 1. use-saved-restaurants.ts (localStorage)
- Seeds 3 restaurants, exposes save/unsave/toggle + stats
- Replace with: trpc.savedRestaurant.list/save/unsave/toggle

### 2. use-customer-orders.ts (in-memory)
- Seeds 3 orders with line items + reviews
- Replace with: trpc.order.list + trpc.review.create/listByRestaurant

### 3. use-order-management.ts (in-memory)
- Seeds 4 orders, full owner order management with status transitions
- Has TODO: "Replace with tRPC hooks once order module is built"
- Replace with: trpc.order.listByBranch/accept/reject/updateStatus/confirmPayment/rejectPayment

### 4. use-payment-config.ts (in-memory)
- Seeds 3 payment methods (GCash, Maya, Bank)
- Replace with: trpc.paymentConfig.list/add/update/remove/setDefault

### 5. use-owner-verification.ts (hybrid: tRPC + local)
- Fetches restaurants via tRPC, stores verification drafts locally
- Seeds uploaded documents for demo restaurants
- Replace with: trpc.verification.getDraft/uploadDocument/removeDocument/submit

### 6. use-branch-settings.ts (hybrid: tRPC + local)
- Fetches branch via tRPC, stores weekly hours locally
- Replace with: trpc.branch.getOperatingHours/updateOperatingHours

### 7. use-admin-users.ts (hybrid: tRPC + local)
- Fetches users via tRPC, manages access toggle locally
- Replace with: trpc.admin.setUserActive mutation

### 8. use-onboarding-status.ts (hybrid: tRPC + hardcoded)
- Steps 1-3 from tRPC, steps 4-6 hardcoded false
- Replace with: trpc.menu.hasContent + trpc.paymentConfig.has + trpc.verification.isSubmitted

## 3 Stub Data Locations
- src/app/(public)/page.tsx: FEATURED_RESTAURANTS, NEARBY_RESTAURANTS
- src/app/(public)/search/page.tsx: ALL_RESTAURANTS
- src/features/discovery/components/location-filter.tsx: LOCATION_OPTIONS

## Client Integration Pattern
```tsx
const trpc = useTRPC();
const { data } = useQuery(trpc.{router}.{procedure}.queryOptions({ ... }));
const mutation = useMutation(trpc.{router}.{procedure}.mutationOptions());
```
