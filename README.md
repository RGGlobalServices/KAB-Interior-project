# 🏠 AI Interior Design Platform

A professional full-stack web application for interior design collaboration with AI-powered features, CAD-style annotations, and real-time team communication.

![Flask](https://img.shields.io/badge/Flask-3.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991)
![Python](https://img.shields.io/badge/Python-3.12+-green)

## ✨ Features

### 🎨 **Professional CAD Annotation Editor**
- **11 Drawing Tools**: Pencil, Line, Arrow, Rectangle, Circle, Text, Eraser, Select, Pan, Distance Measurement, Angle Measurement
- **Full-Screen Editor**: Dedicated annotation workspace
- **15 Color Palette**: Professional color selection
- **5 Line Widths**: Customizable stroke sizes
- **Zoom & Pan**: 25%-400% zoom with smooth panning
- **Keyboard Shortcuts**: Fast tool switching (S, P, L, A, R, C, T, E, M, G)
- **Auto-Save**: Real-time annotation persistence
- **Undo/Redo**: Non-destructive editing

### 🤖 **AI-Powered Q&A**
- **OpenAI GPT-4 Integration**: Intelligent design assistance
- **Context-Aware**: Analyzes project details and uploaded files
- **Professional Expertise**: Interior design and architecture knowledge
- **Async Processing**: Non-blocking AI responses
- **Smart Fallback**: Graceful handling when API unavailable

### 💬 **Team Collaboration**
- **Real-Time Discussions**: Project-based team chat
- **User Attribution**: Track who said what
- **Chronological History**: Full conversation timeline
- **Clean UI**: Modern chat interface

### 📁 **File Management**
- **Multi-Format Support**: PDF, Excel, Images
- **50MB File Limit**: Large document support
- **Secure Storage**: Organized upload system
- **File Preview**: Integrated viewer

### 🔐 **Authentication & Security**
- **JWT Authentication**: Secure token-based auth
- **User Roles**: Role-based access control
- **Password Hashing**: bcrypt encryption
- **Protected Routes**: API security

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- OpenAI API Key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-interior-design-flask.git
cd ai-interior-design-flask
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**
```bash
# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key (optional)
# OPENAI_API_KEY=your-api-key-here
```

5. **Run the application**

**Backend (Flask):**
```bash
python app.py
```
Flask runs on http://localhost:5000

**Frontend (React):**
```bash
cd frontend
npm run dev
```
Vite runs on http://localhost:3000

## 📖 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Detailed installation instructions
- **[Railway Deployment](RAILWAY_DEPLOYMENT.md)** - Deploy to Railway in 5 minutes
- **[OpenAI Integration](OPENAI_SETUP_GUIDE.md)** - AI features configuration
- **[Annotation Guide](ANNOTATION_FEATURE_GUIDE.md)** - CAD editor documentation
- **[Features Overview](FEATURES.md)** - Complete feature list
- **[API Documentation](API_DOCS.md)** - REST API reference

## 🛠️ Tech Stack

### Backend
- **Flask 3.0.0** - Web framework
- **SQLAlchemy** - ORM
- **Flask-Login** - Authentication
- **Flask-JWT-Extended** - JWT tokens
- **OpenAI API** - GPT-4 integration
- **bcrypt** - Password hashing

### Frontend
- **React 19.2.0** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Font Awesome** - Icons

### Database
- **SQLite** - Development database
- (PostgreSQL recommended for production)

## 📁 Project Structure

```
ai-interior-design-flask/
├── app.py                 # Flask application entry point
├── models.py             # Database models
├── extensions.py         # Flask extensions
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not in git)
├── routes/               # API routes
│   ├── auth.py          # Authentication
│   ├── projects.py      # Project management
│   ├── annotations.py   # Annotation system
│   ├── qa.py           # Q&A with AI
│   └── discussions.py  # Team discussions
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   └── services/   # API services
│   ├── package.json
│   └── vite.config.js
└── static/
    └── uploads/        # File storage
```

## 🎯 Usage

### Default Login
- **Email**: demo@example.com
- **Password**: demo123

### Creating Projects
1. Login to your account
2. Click "New Project" on dashboard
3. Enter project name and description
4. Upload files (PDF, Excel, Images)

### Using CAD Annotations
1. Open a project
2. Click "Annotations" tab
3. Select a file to annotate
4. Use toolbar tools to draw
5. Annotations auto-save

### AI Q&A
1. Go to project Q&A tab
2. Ask questions about your design
3. Get intelligent GPT-4 responses
4. View Q&A history

## 🔑 Environment Variables

```env
# Flask Configuration
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///interior_design.db

# OpenAI (Optional)
OPENAI_API_KEY=your-openai-api-key
```

## 🚢 Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite
- Set secure SECRET_KEY and JWT_SECRET_KEY
- Enable HTTPS/SSL
- Use production WSGI server (gunicorn)
- Configure CORS properly
- Set up file upload limits
- Enable database backups
- Use environment-specific .env files

### Deploy to Railway (Recommended) 🚂

**Quick 5-minute deployment!**

1. **Sign up at [Railway.app](https://railway.app)**
2. **Click "Start a New Project" → "Deploy from GitHub repo"**
3. **Select this repository**
4. **Add PostgreSQL database** (+ New → Database → PostgreSQL)
5. **Set environment variables:**
   - `SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `JWT_SECRET_KEY` (generate another one)
   - `FLASK_ENV=production`
   - `OPENAI_API_KEY` (optional)
6. **Generate domain** and your app is live!

📚 **[Complete Railway Deployment Guide](RAILWAY_DEPLOYMENT.md)**

### Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set OPENAI_API_KEY=your-api-key

# Deploy
git push heroku main
```

## 🧪 Testing

```bash
# Run backend tests
python -m pytest

# Run frontend tests
cd frontend
npm test
```

## 📊 Database Schema

### Users
- id, name, email, password, role, created_at

### Projects
- id, name, description, user_id, created_at, updated_at

### Files
- id, name, file_type, file_path, file_size, project_id, uploaded_at

### Annotations
- id, project_id, file_id, user_id, type, x, y, width, height, text, color, page, created_at

### Questions
- id, project_id, user_id, question, answer, answered, created_at, updated_at

### Discussions
- id, project_id, user_id, message, created_at

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Flask team for excellent framework
- React team for powerful UI library
- All open-source contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/ai-interior-design-flask/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/ai-interior-design-flask/discussions)

## 🗺️ Roadmap

- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Advanced PDF text extraction
- [ ] Image analysis with AI
- [ ] 3D visualization
- [ ] Export to AutoCAD
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced user permissions

---

**Made with ❤️ for Interior Designers**
