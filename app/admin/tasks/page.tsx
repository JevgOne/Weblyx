'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../_components/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Globe,
  Loader2,
  Play,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isAdminOrHigher } from '@/lib/auth/permissions';
import type { Task, TaskStatus, TaskPriority } from '@/lib/turso/tasks';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Čeká', color: 'bg-gray-500', icon: Clock },
  in_progress: { label: 'Probíhá', color: 'bg-blue-500', icon: Play },
  completed: { label: 'Hotovo', color: 'bg-green-500', icon: CheckCircle2 },
  cancelled: { label: 'Zrušeno', color: 'bg-red-500', icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Nízká', color: 'border-gray-400 text-gray-600' },
  medium: { label: 'Střední', color: 'border-yellow-400 text-yellow-600' },
  high: { label: 'Vysoká', color: 'border-orange-400 text-orange-600' },
  urgent: { label: 'Urgentní', color: 'border-red-500 text-red-600' },
};

export default function TasksPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [specialists, setSpecialists] = useState<any[]>([]);

  // For create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    domain: '',
    assigned_to: '',
    priority: 'medium' as TaskPriority,
  });

  const isOwnerOrAdmin = isAdminOrHigher(user?.role);

  useEffect(() => {
    loadTasks();
    if (isOwnerOrAdmin) {
      loadSpecialists();
    }
  }, [filterStatus]);

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.set('status', filterStatus);
      }
      if (isOwnerOrAdmin) {
        params.set('stats', 'true');
      }

      const res = await fetch(`/api/admin/tasks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialists = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        const specs = data.users?.filter((u: any) => u.role === 'specialist' && u.active) || [];
        setSpecialists(specs);
      }
    } catch (error) {
      console.error('Failed to load specialists:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title || !newTask.description) return;

    setCreating(true);
    try {
      const specialist = specialists.find(s => s.id === newTask.assigned_to);
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          assigned_to_name: specialist?.name || null,
        }),
      });

      if (res.ok) {
        setCreateOpen(false);
        setNewTask({ title: '', description: '', domain: '', assigned_to: '', priority: 'medium' });
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isOwnerOrAdmin ? 'Všechny úkoly' : 'Moje úkoly'}
            </h1>
            <p className="text-muted-foreground">
              {isOwnerOrAdmin
                ? 'Správa a přiřazování úkolů specialistům'
                : 'Vaše přiřazené úkoly k vypracování'}
            </p>
          </div>
        </div>

        {isOwnerOrAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nový úkol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vytvořit nový úkol</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Název úkolu *</label>
                  <Input
                    placeholder="např. Redesign webu salon-monika.cz"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Doména</label>
                  <Input
                    placeholder="např. salon-monika.cz"
                    value={newTask.domain}
                    onChange={(e) => setNewTask({ ...newTask, domain: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Popis / Brief *</label>
                  <Textarea
                    placeholder="Detailní zadání pro specialistu..."
                    className="min-h-[200px]"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Přiřadit</label>
                    <Select
                      value={newTask.assigned_to}
                      onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vybrat specialistu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nepřiřazeno</SelectItem>
                        {specialists.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priorita</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={createTask} disabled={creating || !newTask.title || !newTask.description}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Vytvořit úkol
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats for Owner/Admin */}
      {isOwnerOrAdmin && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Celkem</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Čeká</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">Probíhá</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Hotovo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
              <div className="text-sm text-muted-foreground">Nepřiřazeno</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      {isOwnerOrAdmin && (
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'in_progress', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'Vše' : STATUS_CONFIG[status as TaskStatus]?.label}
            </Button>
          ))}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {isOwnerOrAdmin
                ? 'Zatím žádné úkoly. Vytvořte první úkol.'
                : 'Nemáte přiřazené žádné úkoly.'}
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOwnerOrAdmin={isOwnerOrAdmin}
              onStatusChange={updateTaskStatus}
              specialists={specialists}
              onUpdate={loadTasks}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isOwnerOrAdmin,
  onStatusChange,
  specialists,
  onUpdate,
}: {
  task: Task;
  isOwnerOrAdmin: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  specialists: any[];
  onUpdate: () => void;
}) {
  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              <h3 className="font-semibold text-lg truncate">{task.title}</h3>
              <Badge variant="outline" className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            </div>

            {/* Domain */}
            {task.domain && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Globe className="w-4 h-4" />
                {task.domain}
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mt-3 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
              {task.description}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              {task.assigned_to_name && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {task.assigned_to_name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.created_at).toLocaleDateString('cs-CZ')}
              </div>
              {task.created_by_name && isOwnerOrAdmin && (
                <div className="text-xs">
                  Vytvořil: {task.created_by_name}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {task.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(task.id, 'in_progress')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Začít
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(task.id, 'completed')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Hotovo
              </Button>
            )}
            {task.status === 'completed' && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Dokončeno
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
