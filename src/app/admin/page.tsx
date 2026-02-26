import { createClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { DogStatus } from '@/lib/constants';

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all data in parallel
  const [
    reportsRes,
    usersRes,
    updatesRes,
    todayRes,
    reports7dRes,
    users7dRes,
  ] = await Promise.all([
    // All reports
    supabase.from('dog_reports').select('*').order('created_at', { ascending: false }),
    // Total users
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    // Total status updates
    supabase.from('status_updates').select('id', { count: 'exact', head: true }),
    // Reports today
    supabase.from('dog_reports').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    // Reports last 7 days (with dates for chart)
    supabase.from('dog_reports').select('created_at').gte('created_at', sevenDaysAgo),
    // User signups last 7 days
    supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo),
  ]);

  const reports = reportsRes.data || [];
  const totalUsers = usersRes.count || 0;
  const totalUpdates = updatesRes.count || 0;
  const reportsToday = todayRes.count || 0;

  // Count reports by status
  const statusCounts: Record<string, number> = {};
  reports.forEach((r) => {
    statusCounts[r.status as DogStatus] = (statusCounts[r.status as DogStatus] || 0) + 1;
  });

  // Build daily counts for last 7 days
  const dailyReports: { date: string; count: number }[] = [];
  const dailySignups: { date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;

    const rCount = (reports7dRes.data || []).filter(
      (r) => r.created_at?.slice(0, 10) === dateStr
    ).length;
    dailyReports.push({ date: dayLabel, count: rCount });

    const uCount = (users7dRes.data || []).filter(
      (u) => u.created_at?.slice(0, 10) === dateStr
    ).length;
    dailySignups.push({ date: dayLabel, count: uCount });
  }

  return (
    <AdminDashboard
      reports={reports}
      totalUsers={totalUsers}
      totalUpdates={totalUpdates}
      reportsToday={reportsToday}
      statusCounts={statusCounts}
      dailyReports={dailyReports}
      dailySignups={dailySignups}
    />
  );
}
