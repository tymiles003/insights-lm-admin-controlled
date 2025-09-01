import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, FileText, MessageSquare, Calendar } from "lucide-react";

export function SystemAnalytics() {
  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['user-growth'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by month
      const monthlyData = data.reduce((acc: any, user) => {
        const month = new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(monthlyData).map(([month, count]) => ({
        month,
        users: count
      }));
    },
  });

  const { data: contentStats } = useQuery({
    queryKey: ['content-stats'],
    queryFn: async () => {
      const [notebooks, sources, notes, messages] = await Promise.all([
        supabase.from('notebooks').select('*', { count: 'exact', head: true }),
        supabase.from('sources').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('n8n_chat_histories').select('*', { count: 'exact', head: true })
      ]);

      return [
        { name: 'Notebooks', value: notebooks.count || 0, color: '#3b82f6' },
        { name: 'Sources', value: sources.count || 0, color: '#10b981' },
        { name: 'Notes', value: notes.count || 0, color: '#f59e0b' },
        { name: 'Messages', value: messages.count || 0, color: '#8b5cf6' }
      ];
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent activity from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('notebooks')
        .select('created_at, updated_at')
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by day
      const dailyActivity = data.reduce((acc: any, item) => {
        const day = new Date(item.updated_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(dailyActivity).map(([day, activity]) => ({
        day,
        activity
      }));
    },
  });

  const { data: topUsers } = useQuery({
    queryKey: ['top-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          notebooks:notebooks(count),
          notes:notes(count)
        `);
      
      if (error) throw error;
      
      return data
        .map(user => ({
          ...user,
          notebook_count: user.notebooks?.[0]?.count || 0,
          note_count: user.notes?.[0]?.count || 0,
          total_activity: (user.notebooks?.[0]?.count || 0) + (user.notes?.[0]?.count || 0)
        }))
        .sort((a, b) => b.total_activity - a.total_activity)
        .slice(0, 5);
    },
  });

  if (userGrowthLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contentStats?.map((stat) => (
          <Card key={stat.name} className="legal-shadow border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                {stat.name === 'Notebooks' && <FileText className="h-4 w-4" />}
                {stat.name === 'Sources' && <Database className="h-4 w-4" />}
                {stat.name === 'Notes' && <MessageSquare className="h-4 w-4" />}
                {stat.name === 'Messages' && <MessageSquare className="h-4 w-4" />}
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="legal-shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowth && userGrowth.length > 0 ? (
              <ChartContainer
                config={{
                  users: {
                    label: "Users",
                    color: "#3b82f6",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No user growth data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card className="legal-shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {contentStats && contentStats.length > 0 ? (
              <ChartContainer
                config={{
                  notebooks: { label: "Notebooks", color: "#3b82f6" },
                  sources: { label: "Sources", color: "#10b981" },
                  notes: { label: "Notes", color: "#f59e0b" },
                  messages: { label: "Messages", color: "#8b5cf6" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {contentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No content data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="legal-shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Recent Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityData && activityData.length > 0 ? (
              <ChartContainer
                config={{
                  activity: {
                    label: "Activity",
                    color: "#10b981",
                  },
                }}
                className="h-48"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="activity" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                No recent activity data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="legal-shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers?.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user.email}</div>
                      {user.full_name && (
                        <div className="text-sm text-slate-600">{user.full_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {user.total_activity} items
                    </div>
                    <div className="text-xs text-slate-600">
                      {user.notebook_count} notebooks, {user.note_count} notes
                    </div>
                  </div>
                </div>
              ))}
              {(!topUsers || topUsers.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  No user activity data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}