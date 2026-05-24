# AI & Background Workers

VedaAI relies heavily on Large Language Models (LLMs) to perform dynamic pedagogical creation and automated evaluations. Due to the high latency of LLM inference, the system utilizes a robust queuing architecture.

## Background Queues (BullMQ & Redis)
Instead of forcing HTTP requests to wait 30-60 seconds for Gemini to respond, VedaAI uses **BullMQ** backed by **Redis**:
1. Controller submits a job to `generationQueue`.
2. Controller immediately responds with HTTP 200 OK to the client.
3. The `generationWorker` picks up the job from the Redis queue.
4. The worker periodically emits WebSocket events (`job_progress`) back to the specific client using socket.io.

## Gemini API Integration
The primary intelligence engine is Google's Vertex/Gemini API via `@google/genai`.
- **System Instructions:** Custom personas are injected to force the model to act as a strict examiner or grader.
- **Structured JSON Output:** We enforce `responseMimeType: "application/json"` and strict `responseSchema` definitions. This ensures Gemini returns perfectly parsable arrays of questions (with multiple choices, marks, and correct answers) rather than loose text.

## Context Grounding
When an assignment is created, the AI module pulls physical context files from the Reference Library. 
- It uses the Gemini API's File Manager (`google.files.upload`) to upload PDF/TXT binaries directly to Google's temporary context window.
- The model uses this specific context to generate questions that strictly adhere to the uploaded textbook or syllabus, drastically reducing hallucinations.

## Auto-Grading Engine
When a quiz is submitted:
1. The AI extracts the exact correct answers generated in the original assignment.
2. It compares them against the student's raw text inputs.
3. It performs a semantic evaluation to determine if the student's answer captures the correct technical essence.
4. It dynamically awards marks and returns personalized feedback arrays.
