import { api } from './auth';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  user: {
    _id: string;
    name: string;
    email: string;
  };
  completedAt?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  'in-progress': number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: Task['status'];
  priority?: Task['priority'];
  search?: string;
  tag?: string;
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: Task[];
}

export interface TaskResponse {
  success: boolean;
  data: Task;
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}

// Tasks API functions
export const tasksAPI = {
  // Get all tasks with filters
  getTasks: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  // Get single task
  getTask: async (id: string): Promise<TaskResponse> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskData): Promise<TaskResponse> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<TaskResponse> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Get task statistics
  getStats: async (): Promise<TaskStatsResponse> => {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },
};

// Task utility functions
export const taskUtils = {
  // Get status color
  getStatusColor: (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get priority color
  getPriorityColor: (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Check if task is overdue
  isOverdue: (task: Task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  },

  // Check if task is due today
  isDueToday: (task: Task) => {
    if (!task.dueDate) return false;
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    return (
      today.getFullYear() === dueDate.getFullYear() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getDate() === dueDate.getDate()
    );
  },

  // Format due date
  formatDueDate: (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  },

  // Sort tasks
  sortTasks: (tasks: Task[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    return [...tasks].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Task];
      let bValue: any = b[sortBy as keyof Task];

      // Handle date fields
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle priority sorting
      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[aValue as Task['priority']];
        bValue = priorityOrder[bValue as Task['priority']];
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  // Filter tasks
  filterTasks: (tasks: Task[], filters: Omit<TaskFilters, 'page' | 'limit' | 'sortBy' | 'sortOrder'>) => {
    return tasks.filter(task => {
      // Status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower);
        const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Tag filter
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false;
      }

      // Date filters
      if (filters.dueBefore && task.dueDate) {
        if (new Date(task.dueDate) > new Date(filters.dueBefore)) {
          return false;
        }
      }

      if (filters.dueAfter && task.dueDate) {
        if (new Date(task.dueDate) < new Date(filters.dueAfter)) {
          return false;
        }
      }

      return true;
    });
  },
};

