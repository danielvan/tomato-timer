# TomatoTimer - Timmy

A minimal, clean task management and Pomodoro timer application with Supabase backend.

## 🎨 Design System

### **Visual Identity**
- **Name**: Timmy (clean, minimal branding)
- **Color Palette**: 
  - Primary: `#000000` (black text)
  - Secondary: `rgba(0, 0, 0, 0.6)` (gray text)
  - Background: `#ffffff` (white)
  - Accent: `#ee0000` (red for "Stop" button)

### **Typography**
- **Font**: Helvetica Neue Bold (system fallback: Helvetica, Arial, sans-serif)
- **Sizes**:
  - Headers: `32px` (Tasks title)
  - Body text: `24px` (task names, descriptions)
  - UI elements: `16px` (navigation, buttons, filters)
  - Timer: `400px` (fullscreen timer display)

### **Layout Principles**
- **Minimal design** - no shadows, rounded corners, or visual noise
- **Clean typography hierarchy** with proper line spacing (1.3)
- **White background** throughout
- **Simple borders** and separators only where necessary
- **Hover states** with subtle background changes (`rgba(0, 0, 0, 0.02)`)

## 🏗️ Technical Architecture

### **Frontend**
- **Vanilla JavaScript** (no frameworks)
- **CDN Tailwind CSS** for utility classes
- **Modular structure**:
  - `tasks.js` - Task CRUD operations and UI
  - `timer.js` - Pomodoro timer functionality
  - `src/auth/` - Authentication system
  - `src/api/` - Supabase API interactions
  - `src/sync/` - Data synchronization

### **Backend & Database**
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Authentication** via Supabase Auth

### **Database Schema**
```sql
-- Core tables
profiles (id, email, full_name, avatar_url, created_at, updated_at)
tasks (id, user_id, name, description, project, status, priority, deadline, order_index, created_at, updated_at)
task_groups (id, user_id, name, description, color, priority, is_active, order_index, created_at, updated_at)
dividers (id, user_id, text, order_index, created_at)
focus_sessions (id, user_id, group_id, duration_minutes, completed_tasks, notes, started_at, completed_at)

-- Enums
task_status: 'not-started' | 'in-progress' | 'done' | 'waiting'
task_priority: 'low' | 'medium' | 'high'
```

## 🔧 Development Guidelines

### **Code Style**
- **No comments** unless absolutely necessary for complex logic
- **Consistent naming**: camelCase for functions, kebab-case for CSS classes
- **Minimal abstractions** - prefer explicit code over clever solutions
- **ES6+ features** but maintain browser compatibility

### **File Organization**
```
├── index.html              # Main app entry point
├── styles.css              # All styles (Timmy design system)
├── tasks.js                # Task management logic
├── timer.js                # Pomodoro timer functionality
├── src/
│   ├── api/                # Supabase API interactions
│   ├── auth/               # Authentication system
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files
│   └── sync/               # Data synchronization
├── supabase/
│   └── migrations/         # Database schema changes
└── test/                   # Test files
```

### **Key Features**
- ✅ **Task Management** - Create, edit, delete, filter tasks
- ✅ **Project Organization** - Group tasks by project with filtering
- ✅ **Status Tracking** - Not Started, In Progress, Done, Waiting
- ✅ **Priority Levels** - Low, Medium, High
- ✅ **Pomodoro Timer** - Fullscreen timer with task focus
- ✅ **User Authentication** - Sign up, sign in, user profiles
- ✅ **Real-time Sync** - Multi-device synchronization
- ✅ **Offline Support** - Local storage fallback

## 🚀 Development Commands

### **Setup**
```bash
# No build process required - pure vanilla JS
# Just open index.html in browser or serve locally

# For local development server:
python -m http.server 8000
# or
npx serve .
```

### **Database Management**
```bash
# Run migrations in Supabase SQL Editor
# Files located in: supabase/migrations/

# Latest migration:
# 20241224000001_add_project_column.sql
```

### **Testing**
```bash
# Run tests (if test framework is set up)
npm test

# Manual testing checklist:
# - Create/edit/delete tasks
# - Filter by status and project
# - Timer functionality in fullscreen
# - Authentication flow
# - Real-time sync across tabs
```

## 🐛 Common Issues & Solutions

### **"Could not find column" Errors**
- **Cause**: Database schema out of sync
- **Solution**: Run latest migrations in Supabase SQL Editor
- **Check**: Ensure all columns exist in production database

### **Tasks Disappearing on Refresh**
- **Cause**: Sync issues or missing database columns
- **Solution**: Check browser console for API errors, verify database schema

### **Timer Not Starting**
- **Cause**: JavaScript errors or missing task selection
- **Solution**: Check console for errors, ensure tasks are loaded

## 📝 User Feedback & Iteration

### **Current User Requests**
- [x] Timmy design implementation
- [x] Clean task cards without status pills
- [x] Project filtering and autocomplete
- [x] Fullscreen timer matching Figma design
- [x] Header width fixes

### **Future Considerations**
- [ ] Mobile responsive design
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Export/import functionality
- [ ] Time tracking analytics
- [ ] Team collaboration features

### **Design Feedback**
*Document user feedback here for future reference:*
- User prefers clean, minimal design over colorful UI elements
- Emphasis on typography hierarchy and whitespace
- Functionality over visual flair
- Consistent 24px text sizing for readability

## 🔗 External Dependencies

### **CDN Resources**
- Tailwind CSS: `https://cdn.tailwindcss.com`
- Animate.css: `https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css`
- Confetti: `https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js`
- Supabase: `https://unpkg.com/@supabase/supabase-js@2`
- SortableJS: `https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js`

### **Configuration Required**
- Supabase project URL and anon key in `src/config/supabase-cdn.js`
- Environment variables for production deployment

---

*This file should be updated as the project evolves. Keep it as a single source of truth for project context, design decisions, and development guidelines.*