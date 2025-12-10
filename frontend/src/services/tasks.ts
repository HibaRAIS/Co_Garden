import { http } from "./https";

// Backend task shape (from your controller/SQL)
export type ApiTask = {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null; // mapped to "date" in UI
  status: "to_do" | "in_progress" | "done"; // mapped to UI statuses
  assigned_members?: string[]; // ARRAY(member_id)
};

export const fetchTasks = (params: any = {}) =>
  http.get<ApiTask[]>("/api/tasks", { params }).then((r) => r.data);

// export const updateTask = (id: number, body: Partial<ApiTask>) =>
//   http.put(`/api/tasks/${id}`, body).then(r => r.data);

export const updateTask = (
  id: number,
  body: Partial<ApiTask> & { memberIds?: string[] } // <--- L'extension critique ici
) => http.put(`/api/tasks/${id}`, body).then((r) => r.data);

export const createTask = (body: Partial<ApiTask> & { memberIds?: string[] }) =>
  http.post("/api/tasks", body).then((r) => r.data);

export const deleteTask = (id: number) =>
  http.delete(`/api/tasks/${id}`).then((r) => r.data);

// export type CalendarEvent = { id: number; title: string; date: string };
export type CalendarEvent = {
  id: number;
  title: string;
  date: string; // ISO string
  status: "to_do" | "in_progress" | "done";
  assigned_members?: string[];
};

export const fetchCalendar = (params: any = {}) =>
  http.get<CalendarEvent[]>("/api/calendar", { params }).then((r) => r.data);
