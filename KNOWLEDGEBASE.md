# KNOWLEDGEBASE

## Source of Truth

- **Google Drive (rclone remote):** `default:cravingsph`
- **Absolute local repo path:** `/home/raphaelm/Github/cravingsph`

> Note: `default:cravingsph` is an rclone remote path (Drive), not a local filesystem mount path.

## Current Knowledge Base Tree (`default:cravingsph`)

```text
default:cravingsph/
├── Design System.docx
├── cravings-v1-comments.docx
├── cravingsph-prd-v1.docx
├── alignment/
│   └── 10-03/
│       ├── 00-sources.md
│       ├── 01-alignment-matrix.md
│       └── 02-reconciliation-plan.md
└── suggestions/
    └── 10-03/
        └── v1-prd-userstories-comparison-and-modularization.md
```

## Quick Commands

```bash
# list root
rclone lsf default:cravingsph

# recursive list
rclone lsf default:cravingsph -R
```
