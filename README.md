# FlipScript: The Digital Manuscript Engine

**FlipScript** is an immersive, distraction-free writing environment designed to evoke the tactile feeling of a physical journal. Built with a "handwritten" aesthetic and realistic page-turn physics, it serves as a secure sanctuary for your thoughts, stories, and manuscripts.

---

## ✨ Key Features

- **📖 Immersive Experience**: Realistic 3D-like page flip animations and physics that mimic physical journals.
- **🖊️ Handwritten Aesthetic**: Elegant "ink-on-parchment" design using refined typography and muted sepia tones.
- **🔐 Secure Archive (Google SSO)**: Seamless authentication via Google. No passwords required—just sign in and your manuscripts are instantly synced to your vault.
- **💾 Permanent Vault (MongoDB)**: Automatic, debounced cloud storage. Every letter you type is preserved in your private archive.
- **🚶 Guest Mode**: Start writing immediately without an account. Sign in only when you're ready to export or commit to the archive.
- **🖼️ Export to PDF**: Convert your digital manuscript into a professional PDF ready for sharing.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) & [Framer Motion 12](https://www.framer.com/motion/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) with Persistence
- **3D/Physics**: [Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/)

---

## 🚀 Getting Started

To run FlipScript locally, follow these steps:

### 1. Prerequisites
- Node.js 20.9+
- A Google Cloud Console project for OAuth (Google SSO)
- A MongoDB cluster (Atlas or local)

### 2. Installation
```bash
git clone https://github.com/your-username/flipscript.git
cd flipscript
npm install --legacy-peer-deps
```

### 3. Environment Setup
Rename `.env.example` to `.env.local` and fill in the required variables:

- `MONGODB_URI`: Your MongoDB connection string.
- `AUTH_SECRET`: Generate using `openssl rand -base64 32`.
- `AUTH_GOOGLE_ID`: Your Google OAuth Client ID.
- `AUTH_GOOGLE_SECRET`: Your Google OAuth Client Secret.
- `AUTH_URL`: `http://localhost:3000` (for local dev).

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to start writing.

---

## 📂 Project Structure

- `/app`: App Router pages and API routes.
- `/components`: Reusable UI components (BookViewer, PageFlip, FloatingNavbar, AuthModal).
- `/models`: Mongoose schemas for MongoDB.
- `/store`: Zustand state management for book state.
- `/lib`: Utility functions (DB connection, PDF export).

---

## 📜 License
Dedicated to the craft of writing. &copy; MCMXXVI FlipScripts Labs.
