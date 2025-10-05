# Feedo

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Shark-Bot-X/Feedo/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)

> A modern, full-stack feedback management system with intelligent processing and real-time analytics

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 About

Feedo is a comprehensive feedback management platform built with a modern, modular architecture. It combines a sleek React frontend, a robust Node.js backend, and an intelligent Python processing engine to deliver seamless feedback collection, analysis, and insights.

**What makes Feedo special?**
- 🚀 Modern, responsive UI built with React and Tailwind CSS
- ⚡ Real-time feedback processing and analysis
- 🧠 Intelligent data processing with Python
- 📊 Automated scoring and analytics
- 🔐 Secure and scalable architecture

## ✨ Features

### User Experience
- **Intuitive Interface** - Clean, responsive design with shadcn/ui components
- **Real-time Updates** - Instant feedback submission and processing
- **Rich Analytics** - Visual dashboards and insights
- **Multi-platform** - Works seamlessly across devices

### Technical Features
- **RESTful API** - Well-structured backend for data persistence
- **Background Processing** - Dedicated Python processor for heavy computations
- **Type Safety** - Full TypeScript support for robust development
- **Hot Reloading** - Fast development with Vite's HMR
- **Modular Architecture** - Clean separation of concerns

## 🛠️ Tech Stack

### Frontend
- **[React](https://reactjs.org/)** - UI library for building interactive interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible component library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **RESTful API** - Standard API architecture

### Processor
- **[Python](https://www.python.org/)** - High-level programming language
- **Background Tasks** - Asynchronous data processing
- **Analytics Engine** - Scoring, analysis, and cleanup operations

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Python](https://www.python.org/downloads/) (v3.8.0 or higher)
- npm or [Bun](https://bun.sh/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shark-Bot-X/Feedo.git
   cd Feedo
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   # Add your environment variables here
   # Example:
   # DATABASE_URL=your_database_url
   # API_KEY=your_api_key
   # PORT=3000
   ```

3. **Install dependencies**

   **Frontend (root directory):**
   ```bash
   npm install
   # or
   bun install
   ```

   **Backend:**
   ```bash
   cd backend
   npm install
   # or
   bun install
   cd ..
   ```

   **Python Processor:**
   ```bash
   # Recommended: Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

## 💻 Usage

To run the complete Feedo application, you need to start all three services. Open **three separate terminal windows** and run:

### Terminal 1: Frontend Development Server
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173` with hot-reloading enabled.

### Terminal 2: Backend API Server
```bash
cd backend
node server.js
```
> **Note:** If your entry file is different (e.g., `index.js`), adjust the command accordingly.

The API server will start on the configured port (default: `http://localhost:3000`).

### Terminal 3: Feedback Processor
```bash
# Activate virtual environment if you created one
source venv/bin/activate  # On Windows: venv\Scripts\activate

python feedback_processor.py
```

This runs the Python script for background processing, scoring, and analysis tasks.

### Available Scripts

```bash
npm run dev       # Start frontend development server
npm run build     # Build frontend for production
npm run preview   # Preview production build
npm run lint      # Run linter
```

## 📁 Project Structure

```
Feedo/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   ├── pages/               # Application pages
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Root component
├── backend/                 # Backend source code
│   ├── routes/              # API routes
│   ├── controllers/         # Route controllers
│   ├── models/              # Data models
│   ├── middleware/          # Custom middleware
│   └── server.js            # Entry point
├── public/                  # Static assets
├── feedback_processor.py    # Python processing script
├── requirements.txt         # Python dependencies
├── package.json            # Node.js dependencies & scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions, we appreciate your help in making Feedo better.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all tests pass before submitting

## 🐛 Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/Shark-Bot-X/Feedo/issues) with:
- A clear and descriptive title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by Shark-Bot-X**

[Report Bug](https://github.com/Shark-Bot-X/Feedo/issues) · [Request Feature](https://github.com/Shark-Bot-X/Feedo/issues)

</div>
