

## Problem
The `/resources` page is a standalone public route outside the `AppShell` layout. It has its own custom navbar with just "Sign In" and "Apply for Early Access" links — no sidebar or app navigation.

## Fix
Since this is a **public marketing page** (like the Landing page), it shouldn't use the full AppShell sidebar. However, it's missing consistent navigation back to other public pages. The issue is likely that the user expects the same nav as the landing page.

Two options:

1. **Match the Landing page nav** — reuse the same header/nav from `Landing.tsx` on the Resources page so navigation is consistent across public pages.
2. **Wrap in AppShell** — make `/resources` a protected route inside the app shell (unlikely desired since it's public content).

## Recommended approach: Option 1
Extract or replicate the Landing page's navbar into the Resources page. Looking at the current Resources nav, it already has a similar structure (logo + Sign In + CTA). The fix is to ensure it matches the Landing page nav exactly, including any additional links (e.g., "Resources", "Demo" links if the Landing nav has them).

### Changes
- **`src/pages/Resources.tsx`**: Update the `<nav>` section to match the Landing page's navigation bar, including links to Demo, Resources, and other public pages that the Landing page navbar contains.

