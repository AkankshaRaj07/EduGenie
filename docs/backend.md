# Backend & API Services

The VedaAI backend is a robust Node.js/Express service responsible for handling high-volume AI processing handoffs, real-time communications, and secure file handling.

## Core Architecture
- **Express.js API:** RESTful architecture serving endpoints defined in the `/routes` folder and mapped to the `/api/*` prefix. 
- **MongoDB Database:** Managed via Mongoose schemas. Core entities include `Assignment`, `Library`, `Submission`, and `Group`.
- **WebSocket Server:** Uses `socket.io` mapped onto the core HTTP server to push job progress events asynchronously to active connected clients.

## Modular Controllers
- **`assignmentController.ts`:** Handles the orchestration of new assessment creation. It inserts the preliminary document into MongoDB and dispatches a BullMQ job. Features a dynamic `/download` endpoint that regenerates ephemeral PDF files on the fly for cloud hosts like Render.
- **`libraryController.ts`:** Manages the context library. Uses `multer` for raw file uploads. Handles graceful error callbacks for ephemeral file losses.
- **`submissionController.ts`:** Manages student quiz submissions. Validates data, dispatches the async BullMQ grading job, and emits socket events for grading progress.

## File Storage (Multer & PDFKit)
- The backend utilizes a local `/uploads` directory natively.
- **Multer:** Handles incoming multipart/form-data for library context files.
- **PDFKit:** Exposes a programmatic drawing API (`services/pdfGenerator.ts`) to statically compile the AI-generated JSON sections into a highly formatted, print-ready A4 PDF document, saving the buffer directly to the `/uploads` disk.

## Security & Reliability
- Asynchronous task offloading prevents HTTP timeouts during heavy LLM inference.
- CORS middleware strictly limits domains in production.
- Express async-handler safely catches promise rejections, passing them to standard error responses rather than crashing the Node process.
