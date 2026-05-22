# Version Feature Design

**Date:** 2026-05-22
**Status:** Approved

## Overview

Add a Version feature to Deployment Vault so users can see the current app version and browse a full history of past versions. The version list is developer-maintained and grows as new features ship.

## Data Layer

**File:** `lib/versions.ts`

A typed `Version` interface and a `VERSIONS` constant array. No database, no API — static TypeScript data maintained manually by the developer.

```ts
export interface Version {
  version: string       // e.g. "1.0"
  title: string         // e.g. "Initial design & functionality"
  description?: string  // optional detail line
}

export const VERSIONS: Version[] = [
  {
    version: "1.0",
    title: "Initial design & functionality",
    description: "Auth, companies, projects, credentials, env files, backend docs, and other documents.",
  },
]
```

Array is ordered **newest first**. `VERSIONS[0]` is always the current version. To release a new version, prepend a new entry — no other files need to change.

## Sidebar Badge

**File:** `components/layout/sidebar.tsx` (modified)

A `Link` is added to the existing sidebar footer area (below the `ScrollArea`, above the `AddCompanyDialog`). It reads `VERSIONS[0].version` and renders a small row:

- Left: muted label "v"
- Right: indigo pill showing the version number (e.g. `v1.0`)
- `href="/dashboard/changelog"`
- Styled consistently with the sidebar's light/indigo design system (`bg-indigo-50 text-indigo-700`)

## Changelog Page

**File:** `app/(dashboard)/dashboard/changelog/page.tsx` (new)

A server component under the existing dashboard layout. Auth is already handled by the layout — no additional auth check needed.

Structure:
- Back arrow (`←`) linking to `/dashboard`
- Page heading "Version History" + subtitle "All releases of Deployment Vault"
- `<VersionTimeline versions={VERSIONS} />` component

**File:** `components/layout/version-timeline.tsx` (new)

A client component receiving `versions: Version[]` as a prop. Renders a vertical timeline:

- Vertical indigo line connecting all entries
- Each entry: dot + version badge + title + optional description
- First entry (current): indigo dot, indigo `v1.0` badge, `Current` label in indigo
- All other entries: gray dot, gray badge, muted text

## Routing

- New page route: `/dashboard/changelog`
- Entry point: sidebar footer badge click only — no additional sidebar nav item
- No new API routes

## Adding Future Versions

When a new feature ships, prepend one entry to `VERSIONS` in `lib/versions.ts`:

```ts
{
  version: "1.1",
  title: "Short feature name",
  description: "Optional detail.",
},
```

The sidebar badge and changelog page both update automatically.

## Files Changed

| File | Action |
|------|--------|
| `lib/versions.ts` | Create |
| `components/layout/version-timeline.tsx` | Create |
| `app/(dashboard)/dashboard/changelog/page.tsx` | Create |
| `components/layout/sidebar.tsx` | Modify — add footer badge |
