import React from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  TrendingUp,
  Calendar,
  Target,
  Users
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { tasksAPI, TaskStats, Task } from '@/lib/tasks';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  change?: string;
}> = ({ title, value, icon: Icon, color, change }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const RecentTaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      default:
        return 'border-green-500';
    }
  };

  return (
    <div className={`p-4 border-l-4 ${getPriorityColor(task.priority)} bg-white rounded-r-lg shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 truncate">{task.description}</p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            <span className={`badge ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch task statistics
  const { data: statsData, isLoading: statsLoading } = useQuery<{ data: TaskStats }>(
    'task-stats',
    () => tasksAPI.getStats(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch recent tasks
  const { data: recentTasksData, isLoading: tasksLoading } = useQuery<{ data: Task[] }>(
    'recent-tasks',
    () => tasksAPI.getTasks({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }).then(res => ({ data: res.data })),
    {
      refetchInterval: 30000,
    }
  );

  const stats = statsData?.data;
  const recentTasks = recentTasksData?.data || [];

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Primetrade</title>
      </Head>

      <DashboardLayout title="Dashboard">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Here's what's happening with your tasks today.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Tasks"
                value={stats?.total || 0}
                icon={Target}
                color="bg-blue-500"
                change="+12%"
              />
              <StatCard
                title="In Progress"
                value={stats?.['in-progress'] || 0}
                icon={Clock}
                color="bg-yellow-500"
                change="+5%"
              />
              <StatCard
                title="Completed"
                value={stats?.completed || 0}
                icon={CheckCircle}
                color="bg-green-500"
                change="+18%"
              />
              <StatCard
                title="Overdue"
                value={stats?.overdue || 0}
                icon={AlertTriangle}
                color="bg-red-500"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Tasks */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                    <button className="btn btn-primary btn-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </button>
                  </div>

                  {tasksLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentTasks.length > 0 ? (
                    <div className="space-y-4">
                      {recentTasks.map((task) => (
                        <RecentTaskItem key={task._id} task={task} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                      <p className="text-gray-600 mb-4">Get started by creating your first task.</p>
                      <button className="btn btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Today</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {stats?.dueToday || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-semibold text-yellow-600">
                        {stats?.pending || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Priority Distribution */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Urgent', color: 'bg-red-500', count: 2 },
                      { label: 'High', color: 'bg-orange-500', count: 5 },
                      { label: 'Medium', color: 'bg-yellow-500', count: 8 },
                      { label: 'Low', color: 'bg-green-500', count: 3 },
                    ].map((priority) => (
                      <div key={priority.label} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${priority.color} mr-3`}></div>
                        <span className="text-sm text-gray-600 flex-1">{priority.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{priority.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Activity */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-white">JD</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">John Doe completed 3 tasks</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-white">AS</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Alice Smith created new project</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-white">MB</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Mike Brown updated task priority</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

