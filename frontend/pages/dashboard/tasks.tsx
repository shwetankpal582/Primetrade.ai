import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { tasksAPI, Task, CreateTaskData, UpdateTaskData, TaskFilters, taskUtils } from '@/lib/tasks';

// Task Form Modal Component
const TaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSuccess: () => void;
}> = ({ isOpen, onClose, task, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskData>({
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags,
    } : {
      status: 'pending',
      priority: 'medium',
    },
  });

  const createMutation = useMutation(tasksAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('task-stats');
      toast.success('Task created successfully!');
      reset();
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  const updateMutation = useMutation(
    (data: UpdateTaskData) => tasksAPI.updateTask(task!._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('task-stats');
        toast.success('Task updated successfully!');
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      },
    }
  );

  const onSubmit = (data: CreateTaskData) => {
    // Process tags
    const processedData = {
      ...data,
      tags: typeof data.tags === 'string' 
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : data.tags || [],
      dueDate: data.dueDate || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEdit ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input"
                    placeholder="Enter task description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select {...register('status')} className="input">
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select {...register('priority')} className="input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    {...register('dueDate')}
                    type="date"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="input"
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Task' : 'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline w-full mt-3 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Task Item Component
const TaskItem: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}> = ({ task, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            <span className={`badge ${taskUtils.getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`badge ${taskUtils.getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-600 mb-3">{task.description}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={taskUtils.isOverdue(task) ? 'text-red-600' : ''}>
                  {taskUtils.formatDueDate(task.dueDate)}
                  {taskUtils.isOverdue(task) && ' (Overdue)'}
                </span>
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span>{task.tags.join(', ')}</span>
              </div>
            )}

            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(task);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    onDelete(task);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery(
    ['tasks', filters],
    () => tasksAPI.getTasks(filters),
    {
      keepPreviousData: true,
    }
  );

  // Delete task mutation
  const deleteMutation = useMutation(tasksAPI.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('task-stats');
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.total || 0;
  const pagination = tasksData?.pagination;

  // Filter handlers
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: Task['status'] | '') => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handlePriorityFilter = (priority: Task['priority'] | '') => {
    setFilters(prev => ({ ...prev, priority: priority || undefined, page: 1 }));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteMutation.mutate(task._id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Tasks - Primetrade</title>
      </Head>

      <DashboardLayout title="Tasks">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                <p className="mt-2 text-gray-600">
                  Manage your tasks and track progress
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Task
              </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="input pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input"
                  onChange={(e) => handleStatusFilter(e.target.value as Task['status'])}
                  value={filters.status || ''}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="input"
                  onChange={(e) => handlePriorityFilter(e.target.value as Task['priority'])}
                  value={filters.priority || ''}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  className="input"
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(':');
                    setFilters(prev => ({ 
                      ...prev, 
                      sortBy: sortBy as any, 
                      sortOrder: sortOrder as 'asc' | 'desc' 
                    }));
                  }}
                  value={`${filters.sortBy}:${filters.sortOrder}`}
                >
                  <option value="updatedAt:desc">Recently Updated</option>
                  <option value="createdAt:desc">Recently Created</option>
                  <option value="dueDate:asc">Due Date (Earliest)</option>
                  <option value="priority:desc">Priority (Highest)</option>
                  <option value="title:asc">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <>
                <div className="space-y-4 mb-8">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {(pagination?.prev || pagination?.next) && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(filters.page! - 1) * filters.limit! + 1} to{' '}
                      {Math.min(filters.page! * filters.limit!, totalTasks)} of {totalTasks} tasks
                    </div>
                    <div className="flex space-x-2">
                      {pagination?.prev && (
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                          className="btn btn-outline"
                        >
                          Previous
                        </button>
                      )}
                      {pagination?.next && (
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                          className="btn btn-outline"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.status || filters.priority
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first task.'}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          task={editingTask}
          onSuccess={() => {}}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

