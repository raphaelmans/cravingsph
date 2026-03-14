# Tasks: Branch Ops Portal (FF)

## Discovery / design
- [ ] Finalize branch portal IA and naming
- [ ] Lock readable route shape (`/branch/:slug`)
- [ ] Finalize slug generation + collision fallback rules
- [ ] Decide branch role names and invite flow

## Spec / contracts
- [ ] Add branch portal routing spec
- [ ] Add branch staff scope spec
- [ ] Add branch ops portal UX spec

## App shell
- [ ] Add feature flags for portal and short routes
- [ ] Add branch portal layout and navigation shell
- [ ] Add smart post-login redirect behavior
- [ ] Add branch switcher for multi-branch users

## Authorization
- [ ] Add branch membership data model
- [ ] Add branch-scoped permission checks
- [ ] Restrict branch portal queries/mutations by membership

## UX
- [ ] Add branch home/dashboard page
- [ ] Add easy shareable branch URL from owner console
- [ ] Add branch portal entry CTA from branch detail pages

## Rollout
- [ ] Hide behind feature flags
- [ ] Dogfood on one test branch
- [ ] Validate staff onboarding flow
- [ ] Validate owner multi-branch switching flow
