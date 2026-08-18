import { Router, Request } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/client';
import { sendNotification } from '../services/notification.service';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

type Project = { id: number; name: string; workspaceId: number; archived: boolean };
type Task = {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  assigneeId: number | null;
  dueDate: string | null;
};
type EnrichedTask = Task & { assigneeName: string };

type ReportQuery = {
  projectId: number;
  tz: string;
  includeArchived: boolean;
  groupBy: string;
  startDate: string | undefined;
  endDate: string | undefined;
};

function parseReportQuery(req: Request): ReportQuery {
  return {
    projectId: Number(req.params.projectId),
    tz: (req.query.tz as string) || 'UTC',
    includeArchived: req.query.includeArchived === 'true',
    groupBy: (req.query.groupBy as string) || 'status',
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  };
}

function findProject(projectId: number): Project | undefined {
  return db.find('projects', (r) => r.id === projectId) as Project | undefined;
}

function listProjectTasks(projectId: number): Task[] {
  return db.list('tasks', (r) => r.projectId === projectId) as Task[];
}

function tasksInDateRange(
  tasks: Task[],
  startDate?: string,
  endDate?: string,
): Task[] {
  let filtered = tasks;
  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() >= start;
    });
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() <= end;
    });
  }
  return filtered;
}

function tasksWithAssigneeNames(tasks: Task[]): EnrichedTask[] {
  return tasks.map((t) => {
    let assigneeName = 'unassigned';
    if (t.assigneeId !== null) {
      const u = db.find('users', (r) => r.id === t.assigneeId) as
        | { name: string }
        | undefined;
      if (u) assigneeName = u.name;
    }
    return { ...t, assigneeName };
  });
}

function completionRate(tasks: Array<{ status: string }>): number {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function taskBuckets(
  tasks: EnrichedTask[],
  groupBy: string,
): Record<string, EnrichedTask[]> {
  const buckets: Record<string, EnrichedTask[]> = {};
  for (const t of tasks) {
    const key =
      groupBy === 'status'
        ? t.status
        : groupBy === 'assignee'
          ? t.assigneeName
          : 'all';
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(t);
  }
  return buckets;
}

function formattedDate(iso: string | null, tz: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    // pretending to handle tz
    if (tz === 'UTC') return d.toISOString().slice(0, 10);
    return d.toLocaleDateString('en-US', { timeZone: tz });
  } catch {
    return iso;
  }
}

function buildCsvRows(
  projectName: string,
  rate: number,
  total: number,
  buckets: Record<string, EnrichedTask[]>,
  tz: string,
): string[] {
  const rows: string[] = [];
  rows.push(`# Project Report: ${projectName}`);
  rows.push(`# Generated: ${new Date().toISOString()}`);
  rows.push(`# Completion rate: ${rate}%`);
  rows.push(`# Total tasks: ${total}`);
  rows.push(``);
  rows.push(['Bucket', 'TaskId', 'Title', 'Status', 'Assignee', 'DueDate'].join(','));
  for (const [bucket, items] of Object.entries(buckets)) {
    for (const t of items) {
      rows.push(
        [
          bucket,
          String(t.id),
          `"${t.title.replace(/"/g, '""')}"`,
          t.status,
          `"${t.assigneeName}"`,
          formattedDate(t.dueDate, tz),
        ].join(','),
      );
    }
  }
  return rows;
}

function csvFilename(projectName: string): string {
  return `${projectName.replace(/\s+/g, '_')}.csv`;
}

function notifyReportGenerated(
  projectName: string,
  total: number,
  rate: number,
): void {
  sendNotification({
    to: 'reports@orbittasks.local',
    subject: `Report generated for ${projectName}`,
    body: `${total} tasks, ${rate}% complete`,
  });
}

reportsRouter.get('/project/:projectId.csv', async (req, res) => {
  const { projectId, tz, includeArchived, groupBy, startDate, endDate } =
    parseReportQuery(req);

  const project = findProject(projectId);
  if (!project) {
    res.status(404).json({ error: 'project not found' });
    return;
  }
  if (project.archived && !includeArchived) {
    res.status(404).json({ error: 'project archived' });
    return;
  }

  const enriched = tasksWithAssigneeNames(
    tasksInDateRange(listProjectTasks(projectId), startDate, endDate),
  );
  const total = enriched.length;
  const rate = completionRate(enriched);
  const rows = buildCsvRows(
    project.name,
    rate,
    total,
    taskBuckets(enriched, groupBy),
    tz,
  );

  notifyReportGenerated(project.name, total, rate);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${csvFilename(project.name)}"`,
  );
  res.send(rows.join('\n'));
});
