# tRPC Router Conventions

## Current Routers (8)
admin, health, auth, profile, organization, restaurant, branch, menu

## New Routers Needed
- discovery (public: featured, nearby, search)
- savedRestaurant (protected: list, save, unsave, toggle)
- order (protected: create, list, detail, timeline, accept, reject, updateStatus, confirmPayment, rejectPayment, reorder)
- review (protected: create, listByRestaurant)
- paymentConfig (protected: list, add, update, remove, setDefault)
- verification (protected: getDraft, uploadDocument, removeDocument, submit, updateContact)
- Extensions to branch router: getOperatingHours, updateOperatingHours
- Extensions to admin router: setUserActive
- Extensions to menu router: hasContent (for onboarding)

## Module Structure Convention
```
/modules/{name}/
  ├── {name}.router.ts
  ├── dtos/{name}.dto.ts
  ├── services/{name}.service.ts
  ├── repositories/{name}.repository.ts
  ├── factories/{name}.factory.ts
  └── errors/{name}.errors.ts
```

## Procedure Types
- publicProcedure: no auth (discovery, health, public restaurant/menu)
- protectedProcedure: session required (customer + owner features)
- adminProcedure: admin role required

## Key Patterns
- Zod input validation with transforms (.trim())
- Singleton factory pattern for DI
- Cascading ownership checks (org → restaurant → branch → category → item)
- Transaction wrapping for all mutations
- AppError subclasses with readonly code property
- RequestContext { tx } passed through repository methods
- Slug generation with unique suffix collision handling
