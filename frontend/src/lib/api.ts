const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function publicFetch<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiFetch<User>("/api/auth/me"),
};

// Projects
export const projectApi = {
  list: () => apiFetch<Project[]>("/api/projects"),
  get: (id: number) => apiFetch<ProjectDetail>(`/api/projects/${id}`),
  create: (data: ProjectForm) =>
    apiFetch<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProjectForm) =>
    apiFetch<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch(`/api/projects/${id}`, { method: "DELETE" }),
  stats: (id: number) => apiFetch<StatsData>(`/api/projects/${id}/stats`),
  deleteSubscriber: (id: number, subId: number) =>
    apiFetch(`/api/projects/${id}/subscribers/${subId}`, { method: "DELETE" }),
  resendConfirmation: (id: number, subId: number) =>
    apiFetch(`/api/projects/${id}/subscribers/${subId}/resend`, { method: "POST" }),
};

// Public
export const publicApi = {
  getProject: (slug: string) =>
    publicFetch<Project>(`/api/public/projects/${slug}`),
  getScore: (slug: string) =>
    publicFetch<ValidationScore>(`/api/public/projects/${slug}/score`),
  subscribe: (slug: string, data: SubscribeForm) =>
    apiFetch<{ message: string }>(`/api/public/projects/${slug}/subscribe`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirm: (token: string) =>
    apiFetch<{ message: string; projectSlug: string }>(`/api/public/confirm?token=${token}`),
  unsubscribe: (token: string) =>
    apiFetch<{ message: string }>(`/api/public/unsubscribe?token=${token}`),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  plan: "FREE" | "PAID";
  emailVerified: boolean;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  subscriberCount: number;
  validationScore: number;
  feedbackQuestion?: string;
  launchAt?: string;
  createdAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  confirmed: boolean;
  commitment: "WOULD_USE" | "WOULD_PAY" | "PAY_NOW";
  feedbackAnswer?: string;
  subscribedAt: string;
  confirmedAt?: string;
}

export interface ProjectDetail {
  project: Project;
  subscribers: { items: Subscriber[]; page: number; totalPages: number; total: number };
  pendingCount: number;
  locked: boolean;
}

export interface StatsData {
  project: Project;
  chartData: { label: string; count: number; height: number }[];
  totalSubscribers: number;
  statsDays: number;
  last7Days: number;
}

export interface ValidationScore {
  score: number;
  confirmed: number;
  volumePoints: number;
  commitmentPoints: number;
  momentumPoints: number;
  wouldUse: number;
  wouldPay: number;
  payNow: number;
}

export interface ProjectForm {
  name: string;
  tagline: string;
  description?: string;
  launchAt?: string;
  feedbackQuestion?: string;
  launchEmailSubject?: string;
  launchEmailBody?: string;
  confirmEmailSubject?: string;
  confirmEmailBody?: string;
}

export interface SubscribeForm {
  email: string;
  name?: string;
  commitment?: string;
  feedbackAnswer?: string;
}
