🚀 AI Website Builder
A full-stack, real-time AI-powered platform that generates complete, responsive websites from simple text descriptions. Users can live-preview their sites and make instant adjustments through an integrated AI sidebar chat.

🔗 Live Demo
Frontend: [Link to your Vercel URL]

Backend API: [Link to your Render URL]

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Lucide Icons

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

AI Models: Gemini 3 Flash & Qwen 3.6 Plus (via OpenRouter)

Payments: Razorpay Integration

✨ Key Features
AI Vibe Coding: Generates production-ready HTML/CSS/JS based on natural language prompts.

Real-Time Editor: Features a side-by-side view with a live preview window and an AI chat assistant for iterative design.

Intelligent JSON Extraction: Custom logic to parse and validate AI-generated code structures reliably.

Dynamic Routing: Automatic slug generation for unique project URLs.

📁 Project Structure
Plaintext
/
├── client/          # React frontend (Deployed on Vercel)
└── server/          # Node/Express backend (Deployed on Render)
⚙️ Installation & Setup
Clone the repository:

Bash
git clone https://github.com/your-username/ai-website-builder.git
Setup Backend:

Navigate to /server.

Create a .env file with your MONGODB_URI, OPENROUTER_API_KEY, and RAZORPAY credentials.

Run npm install and npm start.

Setup Frontend:

Navigate to /client.

Update your API base URL to localhost:3000.

Run npm install and npm run dev.