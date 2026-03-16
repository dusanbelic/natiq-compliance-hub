

## Plan: Add "Undo Done" action to Recommendations

Currently, when a recommendation is marked as "Done", only an "IN_PROGRESS" card shows a "Mark Done" button — but a "DONE" card has no actions to revert it.

### Changes

**`src/pages/Recommendations.tsx`**
- In the card render section, add a button for `status === 'DONE'` items — an "Undo" or "Reopen" button that sets the status back to `'OPEN'`.
- Add a `reopenRec` helper that calls `persistStatus(id, 'OPEN')` with a toast confirmation.

This is a single-file, small change.

