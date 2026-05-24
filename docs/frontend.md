# Frontend Architecture

The VedaAI frontend is designed to be highly responsive, modern, and performant, utilizing the latest paradigms from the React and Next.js ecosystems.

## Core Technologies
- **Next.js 14 App Router:** Provides the structural backbone of the application. It enables layout persistence, simplified routing, and optimized builds.
- **Tailwind CSS:** Fully replaces traditional CSS files with utility classes. A highly customized `tailwind.config.ts` extends the theme with specific branding colors (e.g., `#E05058` for the brand primary), and defines sleek `animate-in` transitions.
- **Zustand:** Instead of bulky Redux setups, `useAssignmentStore.ts` safely handles all global application states. This includes assignment lists, library materials, loading spinners, and toast messaging, keeping components decoupled from direct API calls.
- **Socket.io-client:** Establishes a persistent bi-directional pipeline with the backend for streaming real-time job progress (e.g., watching an assignment go from 0% to 100% generated).

## Key Components
- **`LayoutWrapper`:** A pervasive global shell component. It wraps the `children` on all pages, rendering the responsive sidebar on desktop, the bottom navigation on mobile, and the top-level user profile bar. It also renders the global toast notifications.
- **`page.tsx` (Dashboard):** The primary view. It fetches assignments via Zustand, renders them in a grid, and provides dynamic filtering controls (by Class, by Subject, or Text Search) adapted strictly for both mobile and desktop screen sizes.
- **`assignment/[id]/page.tsx`:** The comprehensive detail view. It conditionally renders the "Exam Paper" view, "Take Quiz" form, and "Submissions" log. It tracks WebSocket progress during generation and handles on-the-fly PDF downloads.
- **`library/page.tsx`:** The document management system. Users can upload context files (PDF/TXT) via a drag-and-drop zone. 

## Responsive Design Principles
- Strict separation of mobile and desktop elements using `hidden md:flex` paradigms.
- Safe-area paddings and viewport width caps (`max-w-[100vw] overflow-x-hidden`) to prevent mobile "bounce" and horizontal scroll glitches.
- Absolute positioning and z-indexes for floating drop-down menus over the main DOM flow.
