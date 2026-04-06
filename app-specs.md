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
- **Warm-up Set Logic:** If a user completes a set marked as a "warm-up", the system dynamically pushes a new, uncompleted working set to the end of the exercise array. This ensures warm-ups are recorded but do not consume the allocated working set slots (e.g., staying on Set 1/3).
- **Navigation:** Users can go back to previous exercises and even revert individual previous sets safely using the `handleGoBack` function.
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
- **Replacing Native Alerts:** We strictly avoid using native browser alerts (e.g., `window.confirm` or `alert()`). Instead, we use custom Framer Motion modals (like the Skip Set confirmation) to maintain a premium feel.

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
- [COMPLETED] Custom Exercise Builder: Allow users to create and store their own workouts in the database, including assigning target muscle groups when a desired exercise is not available in the default list  
- [COMPLETED] Advanced Charts & Graphs: Implement detailed analytics including line charts tracking estimated 1RM (One Rep Max) over time, pie charts displaying weekly volume per muscle group, and a body diagram that dynamically updates to reflect muscles trained during the week  
- [COMPLETED] Interactive Muscle Heatmap: Add a visual 3D model or 2D body graphic on the profile tab where muscle groups highlight in red/orange when fatigued from recent workouts and gradually transition to green as they recover  

- [COMPLETED] Weekly Leaderboard Reset: Implement automatic weekly leaderboard resets, including user notifications and profile rewards such as badges or placements based on ranking  
- [PENDING] Shareable Workout Blueprints: Enable users to generate unique links or codes for custom workout splits (e.g., Push Day, Pull Day) that others can instantly import into their app  
- [COMPLETED] Built-in Rest Timer: Add a countdown timer (e.g., 60s, 90s, 120s) that automatically starts after a user marks a set as complete, including an audible alert or buzzer when rest time ends
- [COMPLETED] Plate Calculator Utility: Add a quick-access tool next to weight input fields where users can input a total weight (e.g., 100kg) and receive exact plate distribution per side of the barbell

- [COMPLETED] Badges & Achievements Dashboard: Create a system of unlockable achievements tied to milestones (e.g., “100kg Club” for bench press, “Night Owl” for workouts after 10 PM, “Iron Streak” for a 30-day streak)  
- [COMPLETED] Co-op Workouts: Allow users to link workout sessions with friends where sets completed and XP earned contribute to a shared experience pool in real time  
- [COMPLETED] Warm-up Sets Toggle: Add a toggle option (e.g., 🔥 icon) to mark sets as warm-ups, ensuring they are excluded from PR calculations and fatigue tracking  
- [COMPLETED] Push Notifications: Implement web push notifications (PWA) to remind users about expiring streaks or notify them when friends complete workouts (Hype button implemented)  
- [COMPLETED] 1RM (One Rep Max) Predictions: Build a smart calculation system that estimates a user’s true 1-rep max from higher-rep sets (e.g., 8–12 reps) for key lifts like bench press, squat, and deadlift  

### QoL & UI Polish Roadmap (HELL YEAH Tier):
- [COMPLETED] Visual "Barbell" Plate Calculator: Upgrade the plate calculator in ActiveWorkout to visually render a 2D/3D barbell with colored plates stacked on the sleeve instead of just text output.
- [PENDING] "Workout Wrapped" Card: At the end of a workout, generate a beautiful, trading-card-style summary (Muscle Heatmap, total KG lifted, XP, and Hypes received) that is saveable direct to the phone gallery.
- [PENDING] Smart Progressive Overload Auto-Fill: Predict the next workout target by auto-suggesting +2.5kg if last week's targets were hit comfortably. Display a "📈 Progression Suggested" badge when starting.
- [PENDING] "Zen Mode" Breathing Rest Timer: Convert the active workout rest countdown into a breathing circle (Inhale 4s, Hold 4s, Exhale 4s) using Framer Motion to actively lower heart rate between sets.
- [PENDING] "Trophy Case" Revamp: Re-design the profile achievements into a dedicated Trophy Case with greyed-out silhouettes that light up with glossy, animated gradients when unlocked.
- [PENDING] "Iron Grid" Activity Calendar: Add a GitHub-style 365-square contribution graph to the profile that lights up in theme colors based on daily workout volume or XP.
- [PENDING] "Bench is Taken" Swapper: Add an "Alternate" icon next to exercises. Opens a sleek modal to quickly swap to 3 muscle-equivalent alternatives just for today's session.
- [COMPLETED] The "+2.5kg" Progression Pill: Render a stylish quick-tap "+2.5" bubble next to weight inputs to instantly bump the weight by the smallest increment. (Implemented as a full native +/- 2.5 stepper)
- [COMPLETED] Odometer "Slot Machine" Tickers: Use Framer Motion to make numbers (XP, Timers, Volume) physically roll up and click into place like a slot machine whenever they change.
- [COMPLETED] Frosted Glass (Backdrop-Blur) Everywhere: Give the TopNav, BottomNav, and overlapping Modals the iOS frosted-glass treatment (`backdrop-blur-lg`), letting background components pass cleanly underneath.
- [CANCELLED] Liquid Gradient "Flow State" Backgrounds: Add a massive, blurred, slow-moving CSS radial gradient to the Active Workout background that shifts from calm Indigo to Purple to Green as the workout progresses from 0% to 100%. (Dropped - buggy/invisible on mobile)

### Optimizations Roadmap:
- [COMPLETED] Dynamic Imports (Code Splitting): Implement lazy loading for non-critical components (e.g., SavedWorkoutsModal, heavy chart components), ensuring they are only loaded when triggered by user interaction rather than included in the initial bundle  
- [COMPLETED] In-Memory Caching: Wrap infrequently changing queries (such as global exercise definitions or friend lists) using Next.js unstable_cache to significantly reduce database reads and improve performance  
- [COMPLETED] Service Worker Caching Strategies: Optimize the PWA service worker (Serwist) by applying a stale-while-revalidate caching strategy for the dashboard, enabling instant loading from local cache while fetching and updating fresh data in the background  
