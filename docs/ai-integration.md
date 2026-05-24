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

## AI Teacher's Toolkit
Beyond strict assignment generation, VedaAI offers an entire suite of generative tools designed specifically for educators:
- **Lesson Plan Generator:** Teachers input grade level, subject, topic, and learning objectives, and the AI synthesizes a structured lesson schedule, complete with a contextual "hook" and timeline intervals.
- **Question Bank Builder:** Synthesizes exam-style questions complete with detailed grading schemes, marking rubrics, and varying complexity levels.
- **Feedback Enhancer:** Expands basic teacher draft notes into comprehensive, encouraging, and academically helpful student review comments based on behavioral principles.

## Speech-to-Text Voice Assistance
VedaAI natively integrates Speech Recognition on the frontend. When creating assignments, teachers can click the microphone icon to simply dictate their "Additional Instructions" instead of typing, offering a seamless and accessible UX.

## Auto-Grading Engine
When a quiz is submitted:
1. The AI extracts the exact correct answers generated in the original assignment.
2. It compares them against the student's raw text inputs.
3. It performs a semantic evaluation to determine if the student's answer captures the correct technical essence.
4. It dynamically awards marks and returns personalized feedback arrays.
