# Tasks: Owner Console IA + Team Scope (FF)

## Discovery / design
- [ ] Finalize owner console IA v2
- [ ] Decide workspace switcher behavior
- [ ] Define Team Access UX entry points
- [ ] Define role + scope vocabulary

## Spec / contracts
- [ ] Add owner console navigation spec
- [ ] Add owner workspace model spec
- [ ] Add team access and scope spec

## Sidebar / app shell
- [ ] Add feature flags for sidebar v2 and team access
- [ ] Replace nested sidebar tree with grouped task navigation
- [ ] Add workspace switcher to owner sidebar header
- [ ] Add branch shortcut actions that route into `/branch/:slug`
- [ ] Add clearer active state / badges / quick links

## Team access foundation
- [ ] Define membership data model with scoped assignments
- [ ] Lock user-facing RBAC hierarchy as `Platform -> Business -> Branch`
- [ ] Add role templates (`business_owner`, `business_manager`, `business_viewer`, `branch_manager`, `branch_staff`, `branch_viewer`)
- [ ] Add invite and assignment flows
- [ ] Surface scope labels in UI
- [ ] Restrict relevant owner/staff routes by scope
- [ ] Defer advanced per-permission customization until after role-template rollout

## Rollout
- [ ] Release sidebar v2 behind flag
- [ ] Dogfood with multi-restaurant owner account
- [ ] Validate branch-heavy usage flows
- [ ] Roll out Team Access surfaces incrementally
