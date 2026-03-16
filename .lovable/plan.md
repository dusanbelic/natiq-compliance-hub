

## Investor Demo Readiness — Improvement Plan

Here's what we can do to tighten the experience for an investor demo:

### 1. Disable Signup form (same "Coming Soon" treatment)
The Signup page still calls real `signUp` — it should show a "Coming soon" toast like Login, so investors don't accidentally trigger auth flows or see errors.

### 2. Add a guided demo entry point from the Landing page
The "View Live Demo" button on the landing page should be more prominent. Consider adding a short loading/transition animation when entering demo mode to feel more polished (e.g., a brief branded splash).

### 3. Polish the Forecast page "Simulate" button
The Forecast page's "Simulate Scenario" button has a fake 800ms delay with `setTimeout`. We could make the animation smoother and add a brief success toast so the interaction feels complete.

### 4. Hide incomplete or placeholder sections
- **TeamSection** currently renders `null` — it's hidden, which is good. No action needed.
- The **SocialProofBar** testimonial says "HR Director, Saudi Technology Company" — this is clearly placeholder. We should either hide it or replace with a more credible-looking attribution.
- The **WhyNatIQSection** has unused `PRESS_ITEMS` and `ECOSYSTEM_LOGOS` constants that aren't rendered — clean but fine to leave.

### 5. Add a "Book a Demo" / "Contact Us" CTA
Investors often want to see a clear sales motion. Add a floating or footer CTA button on the landing page (e.g., "Schedule a Call") that opens a Calendly link or shows a contact toast.

### 6. Disable "Forgot Password" and "Start free trial" links on Login
These lead to real flows that won't work. Change them to show "Coming soon" toasts as well, keeping the demo self-contained.

### 7. Tighten the Demo Banner copy
The current banner says "You are viewing a live demo. Data shown is illustrative." — consider making it more investor-friendly: "Live Product Demo — Sample data for illustration."

---

### Summary of changes
| Area | Change |
|------|--------|
| Signup page | Replace `handleSubmit` with "Coming soon" toast |
| Login page | Disable "Forgot password" and "Start free trial" links with toasts |
| Landing page | Add a "Schedule a Call" CTA or similar investor-facing action |
| Demo Banner | Refine copy to be more investor-friendly |
| SocialProofBar | Hide or refine the placeholder testimonial attribution |
| Forecast page | Add success toast after scenario simulation |

All changes are cosmetic/UX — no database or backend modifications needed.

