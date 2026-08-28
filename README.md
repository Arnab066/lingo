# Lingo - A MERN Stack Duolingo Clone

Lingo is a high-fidelity, interactive language learning application modeled directly on Duolingo. It is built using the MERN stack (MongoDB, Express, React, Node.js) and features JWT authentication, a time-regenerating 5-hearts health check, dynamic lessons for 50 different languages, and a Stripe-like payment checkout for upgrading to the premium "Super Lingo" subscription.

🦉 **Fluent in Fun, Simple to Learn.**
---
## 🚀 Key Features

*   **Secure JWT Authentication**: Register and log in securely. Credentials are encrypted on MongoDB using `bcryptjs` and session states are authorized using JSON Web Tokens.
*   **50 Languages Selector**: Select from a catalog of 50 languages grouped by popularity and region (Popular, Europe, Asia, Americas & Africa, and Classical & Fantasy). Switch courses at any time.
*   **Procedural Quiz Generator**: Dynamic lesson plans compiling translation builders, multiple-choice questions, match-pair grids, and audio cards.
*   **Hearts Health System**: Normal accounts start with 5 hearts. Mistakes deduct health. Health regenerates over time (1 heart every 10 minutes) or can be refilled instantly in the Shop with gems.
*   **Super Lingo Premium Checkout**: Stripe simulated credit card payment form. Subscribing upgrades user flags in the DB, unlocking unlimited hearts, turning off advertisements, and bathing the UI in a purple-gold glowing theme.
*   **Real-time Synthesized Audio**: Click taps, success chimes, failure buzzers, and victory fanfares generated in real-time using browser native Web Audio API oscillators.
*   **Text-to-Speech Pronunciation**: Integrates browser SpeechSynthesis voices to narrate target terms on audio listening cards.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Lucide Icons, Canvas-Confetti, Web Audio API.
*   **Backend**: Node.js, Express, JSON Web Tokens (JWT), Bcrypt.
*   **Database**: MongoDB, Mongoose ODM.
*   **Styling**: Responsive Vanilla CSS containing Duolingo's iconic flat 3D-button layout.

---

## 📂 Directory Layout

```text
Lingo/
├── client/                 # React Vite Frontend code
│   ├── src/
│   │   ├── components/     # UI views (Dashboard, Lesson, PremiumModal, etc.)
│   │   ├── data/           # 50 Languages vocabularies and quiz engines
│   │   ├── hooks/          # Real-time Web Audio API sound synthesis hooks
│   │   ├── App.jsx         # App routes and state handlers
│   │   └── App.css         # Styling system & animations
│   └── package.json
│
├── server/                 # Node.js + Express Backend code
│   ├── middleware/         # Token authorization parsers
│   ├── models/             # Mongoose schemas (User database models)
│   ├── routes/             # Authentication & Progression APIs
│   ├── server.js           # Server initializer
│   └── package.json
│
└── package.json            # Root concurrent project orchestrator
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Ensure **Node.js** (v16+) is installed on your computer.
*   Start a local **MongoDB** server listening on the default port `27017` (or set the connection string using environment variables).

### Setup Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Arnab066/lingo.git
    cd lingo
    ```

2.  **Sync Dependencies**:
    Install all frontend, backend, and root dependencies using the orchestration command:
    ```bash
    npm run install-all
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file inside the `server/` directory:
    ```env
    PORT=5000
    JWT_SECRET=your_jwt_secret_key_string
    MONGODB_URI=mongodb://127.0.0.1:27017/lingo
    ```

4.  **Launch the Servers**:
    Run client and server concurrently:
    ```bash
    npm run dev
    ```

5.  **Test the Application**:
    Open your browser and navigate to **`http://localhost:5173/`**. Register a test profile and start playing!
