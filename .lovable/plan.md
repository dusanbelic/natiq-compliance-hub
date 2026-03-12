

## Remove Duplicate Notification Button from Sidebar

The sidebar currently has a notification bell button in its footer section, but the header already provides the same notification bell with unread badge. This is redundant.

### Changes

**`src/components/layout/Sidebar.tsx`**
- Remove the `Bell` import from lucide-react
- Remove the `onNotificationClick` and `unreadCount` props from the `SidebarProps` interface
- Remove the entire "Notifications" button block in the footer section (lines ~161-178)

**`src/components/layout/AppShell.tsx`**
- Remove `onNotificationClick` and `unreadCount` props passed to `<Sidebar>` since they're no longer needed

