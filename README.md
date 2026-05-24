# VedaAI (EduGenie) - AI Assessment Creator 🚀

VedaAI is a comprehensive, AI-powered assessment generation and management platform tailored for educators. It enables teachers to instantly generate customized exam papers, dynamic quizzes, and grading rubrics using advanced AI grounding models (Google Gemini). 

By referencing uploaded syllabus guidelines, textbooks, and past exams in a custom **Reference Library**, VedaAI generates highly accurate, context-aware assessments that perfectly match your curriculum.

---

## 🌟 Key Features

- **Instant Assignment Generation:** Input your subject, class level, topic, and total marks to generate a fully structured exam paper in seconds.
- **AI Context Grounding:** Upload PDFs or TXTs to the Reference Library. VedaAI will strictly reference these materials to generate accurate, curriculum-aligned questions.
- **Automated Formatting (PDFKit):** Beautifully structured, print-ready PDF generation with your custom school header, automatically managed on the server.
- **Interactive Quizzes:** Convert any generated exam into an interactive digital quiz for students to take online.
- **AI Auto-Grading:** Students submit answers, and the AI evaluates them against dynamic grading rubrics, automatically allocating marks and generating performance feedback.
- **Real-Time Progress Tracking:** WebSockets provide a seamless, live loading experience as the AI generates and structures the paper in the background.

---

## 🛠️ Technology Stack

**Frontend:**
- [Next.js 14](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for sleek, modern, and fully responsive UI styling
- [Zustand](https://zustand-demo.pmnd.rs/) for lightweight global state management
- [Lucide React](https://lucide.dev/) for beautiful SVG icons

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) for persistent storage
- [BullMQ](https://docs.bullmq.io/) & [Redis](https://redis.io/) for robust background task queues (AI processing)
- [Socket.io](https://socket.io/) for real-time bi-directional events
- [PDFKit](https://pdfkit.org/) for programmatic PDF generation
- [Google Gemini API](https://ai.google.dev/) for generative AI inference

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas)
- Redis Server (Required for BullMQ background workers)
- Google Gemini API Key

### Local Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/AkankshaRaj07/EduGenie.git
   cd EduGenie
   ```

2. **Backend Configuration:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/edugenie
   REDIS_HOST=localhost
   REDIS_PORT=6379
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Configuration:**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`.

---

## 📚 Documentation Directory

For deep dives into the specific modules and architecture of the application, please refer to the files in the `/docs` folder:

- [Frontend Architecture](./docs/frontend.md)
- [Backend & API Services](./docs/backend.md)
- [AI & Background Workers](./docs/ai-integration.md)
- [Deployment Guide](./docs/deployment.md)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

## 📄 License

This project is proprietary and built for educational assessment automation.
