# 📰 The NSS Chronicle | IIIT-NR Edition

![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-v5-white?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Ollama](https://img.shields.io/badge/AI-Ollama-orange?style=for-the-badge)

> **"Not Me, But You"** - A digital embodiment of the NSS spirit, blending vintage aesthetics with modern web technologies and AI integration.

---

## 📖 Overview

**The NSS Chronicle** is a comprehensive web platform designed for the National Service Scheme unit of IIIT-Naya Raipur. It serves as both a public news portal and an administrative powerhouse. The site features a unique "digital newspaper" design, complete with paper textures, classic typography, and interactive elements.

Beyond its looks, it boasts a robust **Content Management System (CMS)** and **AI-powered features** that allow for dynamic storytelling and automated assistance.

---

## 🏗️ Architecture

The project follows a modern Client-Server architecture with AI service integration.

```mermaid
graph TD
    subgraph Client Side
        Visitor[👤 Visitor]
        Admin[🔑 Admin]
        UI[🖥️ Frontend UI]
        Config[⚙️ Config.js]
    end

    subgraph Server Side
        API[🚀 Express API]
        Auth[🛡️ Logic Layer]
        Uploads[📂 File Storage]
    end

    subgraph External Services
        DB[(🍃 MongoDB Atlas)]
        AI[🤖 Ollama AI]
        Weather[☁️ Open-Meteo API]
    end

    Visitor -->|Reads News| UI
    Admin -->|Uploads Content| UI
    UI -->|Reads API URL| Config
    UI -->|HTTP Requests| API
    API -->|CRUD Operations| DB
    API -->|Generate Content| AI
    API -->|Save Images| Uploads
    UI -->|Fetch Weather| Weather
```

---

## ✨ Key Features

### 🏛️ Public Portal
- **Vintage Newspaper UI**: Custom CSS styling with paper textures, drop caps, and classic fonts (Playfair Display, Cinzel).
- **Dynamic Content**: Real-time loading of news, events, and awards from the database.
- **Interactive Gallery**: A photo essay grid showcasing NSS activities.
- **Live Widgets**: Real-time Weather (Open-Meteo) and Date/Time displays.
- **AI Assistant**: A built-in chatbot to answer queries about NSS.

### 🛠️ Admin Dashboard
- **Secure CMS**: A dedicated `admin.html` portal for managing content.
- **Photo Management**: Upload, view, and delete photos with captions and categories.
- **Event Management**: Add upcoming events to the sidebar.
- **Award Recognition**: Update the "Hall of Fame" section.

### 🤖 AI Integration
- **Story Generator**: Generates full news stories from short photo captions using Ollama.
- **Chatbot**: Context-aware AI assistant for site visitors.

---

## 💻 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Vanilla JS, Glassmorphism UI, Responsive Design |
| **Backend** | Node.js, Express.js | RESTful API, File Uploads (Multer) |
| **Database** | MongoDB Atlas | Cloud NoSQL Database |
| **AI Engine** | Ollama (Llama 3 / Mistral) | Local LLM for text generation |
| **Config** | Dotenv | Environment variable management |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB Atlas** Connection String
- **Ollama** installed and running locally (for AI features)

### 📥 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/nss-chronicle.git
    cd nss-chronicle
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=5003
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nss_db
    OLLAMA_URI=http://127.0.0.1:11434
    ```

4.  **Configure Frontend**
    Ensure `frontend/scripts/config.js` points to your backend:
    ```javascript
    const CONFIG = {
        API_BASE_URL: 'http://localhost:5003'
    };
    ```

### ▶️ Running the Project

**Option 1: Quick Start Script (macOS/Linux)**
```bash
./start.sh
```

**Option 2: Manual Start**
1.  Start the Backend:
    ```bash
    cd backend
    node server.js
    ```
2.  Open `frontend/index.html` in your browser (or use Live Server).

---

## 📂 Project Structure

```text
Website-Final/
├── backend/                 # Server-side Code
│   ├── uploads/             # Image storage
│   ├── .env                 # Environment variables
│   ├── server.js            # Express App Entry Point
│   └── package.json         # Backend Dependencies
├── frontend/                # Client-side Code
│   ├── styles/              # CSS Files (main.css)
│   ├── scripts/             # JS Files (main.js, config.js)
│   ├── index.html           # Main Landing Page
│   └── admin.html           # Admin Dashboard
├── start.sh                 # Startup Script
└── README.md                # Project Documentation
```

---

## 📸 Gallery & Screenshots

*(Add screenshots of the Landing Page, Admin Panel, and AI Chat here)*

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**© 2025 NSS IIIT-Naya Raipur.** Built with ❤️ and ☕.
