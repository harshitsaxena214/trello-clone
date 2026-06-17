# 🎯 KanbaFlow
### The Modern Workspace for Teams and Projects

KanbaFlow is a collaborative workspace platform designed to help teams organize projects, manage workflows, and stay aligned.
Create organizations, collaborate with team members, manage boards, and track work in a clean and intuitive interface.

## 🌐 **Live Demo**

👉 **Try KanbaFlow**(https://kanbaflow.vercel.app)

---

## ✨ Features

### 🏢 Organizations
- Create and manage multiple organizations
- Invite and collaborate with team members
- Switch between organizations seamlessly

### 📋 Boards & Workflows
- Create project boards
- Organize tasks visually
- Manage work across different stages

### 🔐 Secure Authentication
- Google Sign-In
- Protected workspaces
- Secure session management

### 🎨 Modern Experience
- Responsive design
- Fast and intuitive UI
- Built for productivity


---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Express.js, Node.js
- **Database:** MongoDB
- **Authentication:** NextAuth, Google OAuth
- **Styling:** Tailwind CSS, shadcn/ui
- **Deployment:** Vercel & Render

---

## 📂 Project Structure

```bash
KanbaFlow
├── backend
│   ├── prisma
│   ├── src
│   │   ├── generated
│   │   ├── lib
│   │   ├── middlewares
│   │   ├── modules
│   │   │   ├── auth
│   │   │   ├── board
│   │   │   ├── issue
│   │   │   ├── organisation
│   │   │   └── user
│   │   ├── types
│   │   └── index.ts
│   ├── prisma.config.ts
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── app
│   │   │   ├── (auth)
│   │   │   ├── (main)
│   │   │   │   ├── join
│   │   │   │   └── org
│   │   │   │       └── [orgslug]
│   │   │   │           ├── boards
│   │   │   │           ├── layout.tsx
│   │   │   │           └── page.tsx
│   │   │   ├── api
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── globals.css
│   │   ├── components
│   │   ├── hooks
│   │   ├── lib
│   │   ├── types
│   │   ├── auth.ts
│   │   └── proxy.ts
│   └── package.json
│
└── README.md
```

---

### Architecture

- **Frontend:** Next.js App Router
- **Backend:** Express.js API Server
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth + Google OAuth
- **Deployment:** Vercel (Frontend) & Render (Backend)

---

## 🏗️ Architecture

```text
┌─────────────┐
│   Next.js   │
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Express API │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│   Prisma    │
└─────────────┘
```

---

## 👨‍💻 Author

**Harshit Saxena**

Full Stack Developer passionate about building modern web applications, AI-powered products, and automation systems.

🌐 Portfolio: https://harshitsaxena.xyz
