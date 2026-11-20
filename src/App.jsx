import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock3,
  Circle,
  X,
  CalendarDays,
  AlertCircle,
  ArrowRight,
  Layers3,
} from "lucide-react";
import { supabase } from "./supabase";

const statuses = ["To Do", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];
const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  due_date: "",
};
const sampleTasks = [
  {
    id: "demo-1",
    title: "Plan the sprint",
    description: "Break the module into manageable development tasks.",
    priority: "High",
    status: "Completed",
    due_date: "2026-11-11",
  },
  {
    id: "demo-2",
    title: "Build the React dashboard",
    description: "Implement the task board and interactive forms.",
    priority: "High",
    status: "In Progress",
    due_date: "2026-11-13",
  },
  {
    id: "demo-3",
    title: "Connect Supabase database",
    description: "Create the tasks table and test CRUD operations.",
    priority: "Medium",
    status: "To Do",
    due_date: "2026-11-15",
  },
  {
    id: "demo-4",
    title: "Record the project demo",
    description: "Walk through the features and source code.",
    priority: "Low",
    status: "To Do",
    due_date: "2026-11-19",
  },
];
const uid = () =>
  globalThis.crypto?.randomUUID?.() || String(Date.now() + Math.random());

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const isDemo = !supabase;

  // In demo mode tasks persist in this browser; with Supabase they persist in PostgreSQL.
  useEffect(() => {
    async function load() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          setTasks(data || []);
        } else {
          const stored = localStorage.getItem("taskflow-demo");
          setTasks(stored ? JSON.parse(stored) : sampleTasks);
        }
      } catch (error) {
        setNotice(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!isDemo && tasks.length >= 0) return;
    if (!loading) localStorage.setItem("taskflow-demo", JSON.stringify(tasks));
  }, [tasks, isDemo, loading]);

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesText = `${task.title} ${task.description || ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          matchesText &&
          (priorityFilter === "All priorities" ||
            task.priority === priorityFilter)
        );
      }),
    [tasks, query, priorityFilter],
  );
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const active = tasks.filter((t) => t.status === "In Progress").length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const upcoming = tasks
    .filter((t) => t.status !== "Completed" && t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(task) {
    setEditing(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || "",
    });
    setSelected(null);
    setModalOpen(true);
  }

  // Every database mutation checks for errors before updating React state.
  async function saveTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return setNotice("Task title is required.");
    const payload = {
      ...form,
      title: form.title.trim(),
      due_date: form.due_date || null,
    };
    try {
      if (supabase) {
        if (editing) {
          const { data, error } = await supabase
            .from("tasks")
            .update(payload)
            .eq("id", editing)
            .select()
            .single();
          if (error) throw error;
          setTasks((old) => old.map((t) => (t.id === editing ? data : t)));
        } else {
          const { data, error } = await supabase
            .from("tasks")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          setTasks((old) => [data, ...old]);
        }
      } else if (editing) {
        setTasks((old) =>
          old.map((t) => (t.id === editing ? { ...t, ...payload } : t)),
        );
      } else {
        setTasks((old) => [
          { ...payload, id: uid(), created_at: new Date().toISOString() },
          ...old,
        ]);
      }
      setModalOpen(false);
      setNotice(
        editing ? "Task updated successfully." : "Task created successfully.",
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function changeStatus(task, status) {
    try {
      if (supabase) {
        const { error } = await supabase
          .from("tasks")
          .update({ status })
          .eq("id", task.id);
        if (error) throw error;
      }
      setTasks((old) =>
        old.map((t) => (t.id === task.id ? { ...t, status } : t)),
      );
      setSelected((old) => (old?.id === task.id ? { ...old, status } : old));
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", task.id);
        if (error) throw error;
      }
      setTasks((old) => old.filter((t) => t.id !== task.id));
      setSelected(null);
      setNotice("Task deleted.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Layers3 size={21} />
          </span>
          <span>
            task<span className="brand-accent">flow</span>
            <small>WORKSPACE</small>
          </span>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav>
          {[
            ["Dashboard", LayoutDashboard],
            ["My Tasks", ListTodo],
          ].map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-link ${view === name ? "active" : ""}`}
              onClick={() => setView(name)}
            >
              <Icon size={18} />
              {name}
              {name === "My Tasks" && (
                <span className="nav-count">{tasks.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">C</div>
          <div>
            <strong>CSE 310 Project</strong>
            <small>React Web Application</small>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <span className="connection-dot" />{" "}
            {isDemo ? "Local demo mode" : "Supabase connected"}{" "}
            <span className="top-avatar">C</span>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PRODUCTIVITY HUB</div>
              <h1>
                {view === "Dashboard" ? "Good to see you 👋" : "My Tasks"}
              </h1>
              <p>
                {view === "Dashboard"
                  ? "Here's what's happening with your tasks today."
                  : "Keep track of everything you need to get done."}
              </p>
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={17} /> New Task
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              <AlertCircle size={17} />
              {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {view === "Dashboard" && (
            <>
              <div className="stats-grid">
                <Stat
                  icon={<ListTodo size={20} />}
                  label="Total Tasks"
                  value={tasks.length}
                  foot="Across all statuses"
                  tone="blue"
                />
                <Stat
                  icon={<Clock3 size={20} />}
                  label="In Progress"
                  value={active}
                  foot="Currently being worked on"
                  tone="orange"
                />
                <Stat
                  icon={<CheckCircle2 size={20} />}
                  label="Completed"
                  value={completed}
                  foot="Tasks finished"
                  tone="green"
                />
                <Stat
                  icon={<Circle size={20} />}
                  label="To Do"
                  value={tasks.filter((t) => t.status === "To Do").length}
                  foot="Ready to get started"
                  tone="purple"
                />
              </div>
              <div className="overview-grid">
                <section className="panel progress-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Project progress</h2>
                      <p>Your overall completion rate</p>
                    </div>
                    <span className="tag tag-blue">Live overview</span>
                  </div>
                  <div className="progress-body">
                    <div
                      className="progress-ring"
                      style={{ "--percent": `${percent}%` }}
                    >
                      <div>
                        <strong>{percent}%</strong>
                        <span>Complete</span>
                      </div>
                    </div>
                    <div className="progress-legend">
                      <div>
                        <span className="dot green" /> Completed{" "}
                        <strong>{completed}</strong>
                      </div>
                      <div>
                        <span className="dot orange" /> In progress{" "}
                        <strong>{active}</strong>
                      </div>
                      <div>
                        <span className="dot blue" /> To do{" "}
                        <strong>
                          {tasks.filter((t) => t.status === "To Do").length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="panel upcoming-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Upcoming deadlines</h2>
                      <p>Stay ahead of your schedule</p>
                    </div>
                    <CalendarDays size={20} color="#8994a6" />
                  </div>
                  {upcoming.length ? (
                    upcoming.map((t) => (
                      <button
                        className="deadline-row"
                        key={t.id}
                        onClick={() => setSelected(t)}
                      >
                        <div className="deadline-icon">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <strong>{t.title}</strong>
                          <span>{t.due_date}</span>
                        </div>
                        <ArrowRight size={16} />
                      </button>
                    ))
                  ) : (
                    <p className="empty">No upcoming deadlines.</p>
                  )}
                </section>
              </div>
            </>
          )}
          <section className="panel tasks-panel">
            <div className="panel-heading tasks-title">
              <div>
                <h2>{view === "Dashboard" ? "Task board" : "All tasks"}</h2>
                <p>Organize your work and stay on track</p>
              </div>
              <span className="task-total">{filtered.length} tasks</span>
            </div>
            <div className="toolbar">
              <div className="search-field">
                <Search size={18} />
                <input
                  placeholder="Search tasks..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option>All priorities</option>
                {priorities.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="kanban">
              {statuses.map((status) => (
                <div className="kanban-column" key={status}>
                  <div className="column-heading">
                    <span
                      className={`status-dot ${status.replaceAll(" ", "-").toLowerCase()}`}
                    />
                    <strong>{status}</strong>
                    <span className="column-count">
                      {filtered.filter((t) => t.status === status).length}
                    </span>
                  </div>
                  <div className="column-body">
                    {filtered
                      .filter((t) => t.status === status)
                      .map((task) => (
                        <article
                          key={task.id}
                          className="task-card"
                          onClick={() => setSelected(task)}
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setSelected(task)
                          }
                        >
                          <div className="task-card-top">
                            <span
                              className={`priority priority-${task.priority.toLowerCase()}`}
                            >
                              {task.priority} priority
                            </span>
                            <button
                              className="icon-button"
                              title="Edit task"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(task);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                          <h3>{task.title}</h3>
                          <p>
                            {task.description || "No description provided."}
                          </p>
                          <div className="task-card-bottom">
                            <span>
                              <CalendarDays size={14} />
                              {task.due_date || "No due date"}
                            </span>
                            <ArrowRight size={15} />
                          </div>
                        </article>
                      ))}
                    <button
                      className="add-inline"
                      onClick={() => {
                        setForm({ ...emptyForm, status });
                        setEditing(null);
                        setModalOpen(true);
                      }}
                    >
                      <Plus size={16} /> Add task
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {loading && <p className="empty">Loading tasks...</p>}
          </section>
        </div>
      </main>
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div
            className="modal detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <span className="eyebrow">TASK DETAILS</span>
              <button className="icon-button" onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>
            <h2>{selected.title}</h2>
            <p className="detail-description">
              {selected.description || "No description provided."}
            </p>
            <div className="detail-fields">
              <div>
                <span>Priority</span>
                <strong>{selected.priority}</strong>
              </div>
              <div>
                <span>Due date</span>
                <strong>{selected.due_date || "Not set"}</strong>
              </div>
              <div>
                <span>Status</span>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(selected, e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => deleteTask(selected)}
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                className="btn-primary"
                onClick={() => openEdit(selected)}
              >
                <Pencil size={16} /> Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">TASK MANAGEMENT</span>
                <h2>{editing ? "Edit task" : "Create a new task"}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveTask} className="task-form">
              <label>
                Task title{" "}
                <input
                  required
                  maxLength={120}
                  placeholder="What needs to get done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label>
                Description{" "}
                <textarea
                  rows={3}
                  placeholder="Add more details..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <div className="form-grid">
                <label>
                  Priority{" "}
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    {priorities.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status{" "}
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Due date{" "}
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" type="submit">
                  {editing ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, foot, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-foot">{foot}</span>
    </article>
  );
}
