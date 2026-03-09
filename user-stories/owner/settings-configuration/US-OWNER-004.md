# US-OWNER-004: Generate Branch QR Codes

**As a** restaurant owner,
**I want** to generate a QR code for each branch,
**So that** I can display it in-store for menu access.

## Acceptance Criteria

- **Given** a branch has a public URL, **When** I request its QR code, **Then** the system generates a QR representation of that branch URL.
- **Given** I manage multiple branches, **When** I generate QR codes, **Then** each branch receives its own QR tied to the correct branch link.
