# BuffBuddies (formerly GymTracker) - App Specifications & Context

## 🎯 **Project Overview**
BuffBuddies is a mobile-first, highly animated Progressive Web App (PWA) built for gym goers. It focuses on tracking workouts seamlessly, gamifying the experience (XP, levels, and PRs), and social accountability (adding friends and seeing their activity).

## 🛠️ **Tech Stack**
- **Framework:** Next.js (App Router, Turbopack)
- **Database / ORM:** PostgreSQL / Prisma
- **Authentication:** NextAuth (Next.js Auth)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (Page transitions, component mounting/unmounting)
- **Audio:** `use-sound` (UI interaction feedback)
- **PWA:** Managed via Serwist for caching and native-like installation.

---

## 🏗️ **Core Business Logic & Workflows**

### 1. Active Workout Engine (`ActiveWorkout.tsx`)
- **State Management:** The current workout state (sets, reps, weight) is kept in a React state `workoutState`. 
- **Auto-Advancement:** When a user completes a set, `handleCompleteSet` marks `set.completed = true;` and automatically calculates the `nextSetIndex`. If all sets in an exercise are done, it increments the `currentExerciseIndex`.
- **⚠️ CRITICAL RULE:** *Never accidentally delete state mutation logic when adding secondary effects.* Specifically, when injecting sounds or toasts, ensure the baseline app flow (incrementing indexes, setting completeds) remains perfectly intact.
- **Background Sync:** UI updates happen instantly; database saves (`updateWorkoutState`) happen silently in the background. Does not block the user.

### 2. Gamification & Progression
- **XP System:** Users gain XP upon finalizing a workout via `finishWorkoutAction`.
  - Base completion: 100 XP
  - Normal Set: +10 XP
  - Personal Record (PR): +50 XP
  - Regression Penalty: -20 XP (if they lift worse than the previous session)
- **Leveling:** Level is derived from total XP (`Math.floor(user.xp / 1000) + 1`).

### 3. Database & Performance
- **Optimization:** Server-side queries inside `page.tsx` files should ALWAYS heavily utilize `Promise.all([])` to run database fetches in parallel (e.g., getting User stats, friends list, and active workouts simultaneously). This keeps LCP (Largest Contentful Paint) under 2 seconds.
- **Prisma Indexes:** Crucial fields (`userId`, `createdAt`, `friendId`) have `@@index` attached to prevent slow table scans.

---

## 🎨 **UI / UX Themes & Patterns**

### 1. Visual Language
- **Mobile-First:** Components are designed with a max-width (e.g., `max-w-md`) and centralized to mimic a native mobile app screen.
- **Soft UI:** Heavy use of deeply rounded corners (`rounded-3xl`, `rounded-[2rem]`), drop shadows, and active click translations (`active:translate-y-[2px]`).
- **Colors:** Vibrant and game-like. Green (Success/Primary), Blue (Action), Slate (Text/Headers), Red (Destructive/Cancel).

### 2. Animations (`Framer Motion`)
- Every page is wrapped in `<PageTransition>` for native-like fading/sliding between tabs.
- Modals, popups, and milestones use `<AnimatePresence>` to slide in/out naturally.

### 3. Audio Cues (`useAppSounds`)
- `playPop()`: Used for standard clicks, tab navigation, and completing a normal set.
- `playDing()`: Used for milestones (e.g., finishing an exercise or leveling up).
- `playBuzzer()`: Used for validation errors (e.g., trying to complete a set without entering weight/reps).

---

## 🚀 **Future Updates**

> **How to use this section:** Paste your selected future features below. Change the status tag as work progresses.
> **Statuses:** `[PENDING]`, `[WIP]` (Work In Progress), `[COMPLETED]`, `[CANCELLED]`

### Feature Roadmap:
- [COMPLETED] Weekly Streak System Fix: Rework streak tracking logic so streaks update correctly and are counted on a weekly basis rather than daily, aligning with realistic workout frequency  
- [COMPLETED] Haptic Feedback: Integrate tactile feedback using the Web API (navigator.vibrate([50])) to trigger subtle phone vibrations on key button presses (excluding menu buttons) for a more premium feel  
- [PENDING] Custom Exercise Builder: Allow users to create and store their own workouts in the database, including assigning target muscle groups when a desired exercise is not available in the default list  
- [PENDING] Advanced Charts & Graphs: Implement detailed analytics including line charts tracking estimated 1RM (One Rep Max) over time, pie charts displaying weekly volume per muscle group, and a body diagram that dynamically updates to reflect muscles trained during the week  
- [PENDING] Interactive Muscle Heatmap: Add a visual 3D model or 2D body graphic on the profile tab where muscle groups highlight in red/orange when fatigued from recent workouts and gradually transition to green as they recover  

- [PENDING] Weekly Leaderboard Reset: Implement automatic weekly leaderboard resets, including user notifications and profile rewards such as badges or placements based on ranking  
- [PENDING] Shareable Workout Blueprints: Enable users to generate unique links or codes for custom workout splits (e.g., Push Day, Pull Day) that others can instantly import into their app  
- [COMPLETED] Built-in Rest Timer: Add a countdown timer (e.g., 60s, 90s, 120s) that automatically starts after a user marks a set as complete, including an audible alert or buzzer when rest time ends
- [COMPLETED] Plate Calculator Utility: Add a quick-access tool next to weight input fields where users can input a total weight (e.g., 100kg) and receive exact plate distribution per side of the barbell

- [PENDING] Badges & Achievements Dashboard: Create a system of unlockable achievements tied to milestones (e.g., “100kg Club” for bench press, “Night Owl” for workouts after 10 PM, “Iron Streak” for a 30-day streak)  
- [PENDING] Co-op Workouts: Allow users to link workout sessions with friends where sets completed and XP earned contribute to a shared experience pool in real time  
- [COMPLETED] Warm-up Sets Toggle: Add a toggle option (e.g., 🔥 icon) to mark sets as warm-ups, ensuring they are excluded from PR calculations and fatigue tracking  
- [PENDING] Push Notifications: Implement web push notifications (PWA) to remind users about expiring streaks or notify them when friends complete workouts  
- [PENDING] 1RM (One Rep Max) Predictions: Build a smart calculation system that estimates a user’s true 1-rep max from higher-rep sets (e.g., 8–12 reps) for key lifts like bench press, squat, and deadlift  

### Optimizations Roadmap:
- [PENDING] Dynamic Imports (Code Splitting): Implement lazy loading for non-critical components (e.g., SavedWorkoutsModal, heavy chart components), ensuring they are only loaded when triggered by user interaction rather than included in the initial bundle  
- [PENDING] In-Memory Caching: Wrap infrequently changing queries (such as global exercise definitions or friend lists) using Next.js unstable_cache to significantly reduce database reads and improve performance  
- [PENDING] Service Worker Caching Strategies: Optimize the PWA service worker (Serwist) by applying a stale-while-revalidate caching strategy for the dashboard, enabling instant loading from local cache while fetching and updating fresh data in the background  
