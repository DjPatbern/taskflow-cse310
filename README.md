# TaskFlow — React Task Management Web App

## Overview

TaskFlow is an interactive task management web app built with React and Vite. It provides a dashboard, a three-column task board, and forms to create, edit, delete, search, filter, and update tasks. It calculates live progress statistics and highlights upcoming deadlines.

I built TaskFlow to strengthen my skills in React component design, state management, event handling, dynamic rendering, and database CRUD operations. The project uses Supabase PostgreSQL for persistence when configured, and offers a localStorage demonstration mode for local UI exploration.

**Software demonstration video:** [YouTube Video Link](https://youtu.be/ZZ6iHYG2A5c)

## Development Environment

- Visual Studio Code for coding and debugging
- JavaScript (ES6+), React, JSX, and CSS
- Vite for the local development server and build tooling
- Supabase PostgreSQL for persistent database storage
- Git and GitHub for version control
- Browser developer tools for testing

## Features

- Dashboard with total, active, completed, and to-do task counts
- Visual completion percentage and upcoming deadlines
- Create, edit, delete, and inspect tasks
- Change status from task details
- Search by title or description and filter by priority
- Three-column Kanban task board
- Responsive layout
- Supabase persistence, with localStorage fallback for demonstrations

## Getting Started

1. Install Node.js 20.19+ (or 22.12+).
2. Run `npm install`.
3. Run `npm run dev` and open the URL printed by Vite.
4. Without `.env`, the app runs in local demo mode and saves tasks in localStorage.
5. To use Supabase, create a Supabase project and run `supabase.sql` in its SQL Editor.
6. Copy `.env.example` to `.env`, then replace the values with your project URL and **public** anon/publishable key.
7. Restart the Vite development server. The header should show "Supabase connected".
8. Verify that tasks persist after reloading the page.

**Security:** `supabase.sql` contains intentionally public anonymous access policies for a classroom demonstration. Anyone who has the public project key can read and change the tasks. Use only fictional test data. For any real deployment, add Supabase Authentication and user-scoped row-level security policies before sharing the app publicly. Never put a Supabase service-role key in a Vite environment variable.

## Web App Module Requirements

- **Framework:** React
- **Dynamic user interaction:** Task forms, board, status changes, search, and filters
- **Local test server:** Vite (`npm run dev`)
- **Additional requirement:** Supabase PostgreSQL database integration (requires `.env` configuration)
- **Code quality:** Component organization and explanatory comments

## Useful Websites

- [React Documentation](https://react.dev/learn)
- [Vite Documentation](https://vite.dev/guide/)
- [Supabase JavaScript Guide](https://supabase.com/docs/reference/javascript/introduction)
- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Future Work

- Add authentication and per-user task permissions
- Add drag-and-drop task status updates
- Add notifications for approaching deadlines
- Add team collaboration features

## Submission Preparation

See `SUBMISSION_CHECKLIST.md` for verification steps, `VIDEO_SCRIPT.md` for a recording outline, `TIME_LOG.csv` for actual hours, and `REFLECTION_PROMPTS.md` for your learning reflection.
