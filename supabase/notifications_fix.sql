-- Fix notifications: allow INSERT and admin cross-user writes
-- Run this in Supabase SQL Editor

-- 1. Grant INSERT permission to authenticated users
GRANT INSERT ON TABLE notifications TO authenticated;

-- 2. Drop the overly-restrictive single policy
DROP POLICY IF EXISTS "own_notifications" ON notifications;

-- 3. Students can only read/update their own notifications
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Admins can insert notifications for any user (for notice broadcasts & messages)
CREATE POLICY "notifications_insert_admin" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- 5. Students can also insert their own notifications (for local use)
CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
