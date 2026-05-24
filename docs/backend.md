# Backend & API Services

The VedaAI backend is a robust Node.js/Express service responsible for handling high-volume AI processing handoffs, real-time communications, and secure file handling.

## Core Architecture
- **Express.js API:** RESTful architecture serving endpoints defined in the `/routes` folder and mapped to the `/api/*` prefix. 
- **MongoDB Database:** Managed via Mongoose schemas. Core entities include `Assignment`, `Library`, `Submission`, and `Group`.
- **WebSocket Server:** Uses `socket.io` mapped onto the core HTTP server to push job progress events asynchronously to active connected clients.

## Modular Controllers
- **`assignmentController.ts`:** Orchestrates new assessment creation. Inserts preliminary documents into MongoDB, dispatches BullMQ background generation jobs, and handles dynamic PDF `/download` fallbacks that regenerate ephemeral files on the fly. Also handles manual assignment updates and regeneration.
- **`libraryController.ts`:** Manages the context library via `multer` for raw file uploads (PDF/TXT/DOCX). Implements graceful error callbacks for ephemeral file losses on cloud deployments.
- **`submissionController.ts`:** Manages student quiz submissions. Validates answer payloads, dispatches async BullMQ AI grading jobs, and calculates final scores dynamically.
- **`toolkitController.ts`:** Powers the AI Teacher's Toolkit APIs. Manages targeted Gemini API inference for generating lesson plans, compiling question banks, and enhancing teacher feedback remarks natively.
- **`dashboardController.ts`:** Manages the home page analytics (fetching stats) and the CRUD operations for the teacher's persistent To-Do list.
- **`groupController.ts`:** Handles creation and tracking of student groups.

## File Storage (Multer & PDFKit)
- The backend utilizes a local `/uploads` directory natively.
- **Multer:** Handles incoming multipart/form-data for library context files.
- **PDFKit:** Exposes a programmatic drawing API (`services/pdfGenerator.ts`) to statically compile the AI-generated JSON sections into a highly formatted, print-ready A4 PDF document, saving the buffer directly to the `/uploads` disk.

## Security & Reliability
- Asynchronous task offloading prevents HTTP timeouts during heavy LLM inference.
- CORS middleware strictly limits domains in production.
- Express async-handler safely catches promise rejections, passing them to standard error responses rather than crashing the Node process.
