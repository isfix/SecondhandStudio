
import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

function getMonthYear(ts: any) {
  const date = typeof ts === 'string' ? new Date(ts) : ts instanceof Date ? ts : new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch users
    const { data: users = [], error: usersError } = await supabase.from('users').select('*');
    if (usersError) throw usersError;
    // Fetch items
    const { data: items = [], error: itemsError } = await supabase.from('items').select('*');
    if (itemsError) throw itemsError;
    // Fetch analytics events (if any)
    const { data: analyticsEvents = [], error: analyticsError } = await supabase.from('analytics').select('*');
    if (analyticsError) throw analyticsError;

    // Calculate stats
    const totalUsers = users.length;
    const totalItems = items.length;
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalSales = items.filter(item => item.sellStatus === 'sold').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    // Calculate monthly stats
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const lastMonth = `${now.getFullYear()}-${now.getMonth()}`;
    // Users
    const usersByMonth = users.reduce((acc: any, u: any) => {
      const m = getMonthYear(u.createdAt || u.created_at || u.created_at_timestamp || now);
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const usersThisMonth = usersByMonth[thisMonth] || 0;
    const usersLastMonth = usersByMonth[lastMonth] || 0;
    const userChange = percentChange(usersThisMonth, usersLastMonth);
    // Items
    const itemsByMonth = items.reduce((acc: any, i: any) => {
      const m = getMonthYear(i.createdAt || i.created_at || i.created_at_timestamp || now);
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const itemsThisMonth = itemsByMonth[thisMonth] || 0;
    const itemsLastMonth = itemsByMonth[lastMonth] || 0;
    const itemChange = percentChange(itemsThisMonth, itemsLastMonth);
    // Views
    const viewsByMonth = items.reduce((acc: any, i: any) => {
      const m = getMonthYear(i.createdAt || i.created_at || i.created_at_timestamp || now);
      acc[m] = (acc[m] || 0) + (i.views || 0);
      return acc;
    }, {});
    const viewsThisMonth = viewsByMonth[thisMonth] || 0;
    const viewsLastMonth = viewsByMonth[lastMonth] || 0;
    const viewChange = percentChange(viewsThisMonth, viewsLastMonth);
    // Sales
    const salesByMonth = items.filter((i: any) => i.sellStatus === 'sold').reduce((acc: any, i: any) => {
      const m = getMonthYear(i.updatedAt || i.updated_at || i.updated_at_timestamp || now);
      acc[m] = (acc[m] || 0) + (parseFloat(i.price) || 0);
      return acc;
    }, {});
    const salesThisMonth = salesByMonth[thisMonth] || 0;
    const salesLastMonth = salesByMonth[lastMonth] || 0;
    const salesChange = percentChange(salesThisMonth, salesLastMonth);

    // Item stats by category
    const categories = [...new Set(items.map((item: any) => item.category).filter(Boolean))];
    const itemStats = {
      labels: categories,
      views: categories.map(cat => items.filter((item: any) => item.category === cat).reduce((sum: number, item: any) => sum + (item.views || 0), 0)),
      likes: categories.map(cat => items.filter((item: any) => item.category === cat).reduce((sum: number, item: any) => sum + (item.likes || 0), 0)),
    };

    // User growth (fake data for now)
    const userGrowth = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      users: [5, 10, 15, 20, 25, totalUsers],
    };

    return NextResponse.json({
      totalUsers,
      totalItems,
      totalViews,
      totalSales,
      itemStats,
      userGrowth,
      userChange,
      itemChange,
      viewChange,
      salesChange,
      recentActivity: analyticsEvents.slice(-10).reverse(),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
