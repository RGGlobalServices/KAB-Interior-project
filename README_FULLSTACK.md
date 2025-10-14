# AI Interior Design - Full Stack React + Flask

A modern, responsive full-stack web application for interior design collaboration with AI-powered features. Built with React.js frontend and Flask backend.

## 🚀 Features

- **Fully Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Modern React Frontend**: Built with React 19, Vite, and Tailwind CSS
- **Flask Backend API**: RESTful API with JWT authentication
- **Project Management**: Create, manage, and collaborate on interior design projects
- **File Upload & Management**: Support for PDF, Excel, and image files
- **Real-time Collaboration**: Annotations, Q&A, and discussions
- **AI-Powered Features**: OpenAI integration for design suggestions

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database management
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Database (can be switched to PostgreSQL/MySQL)

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
cd ai-interior-design-flask
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Node.js dependencies**
```bash
npm install
```

4. **Create environment file**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

5. **Initialize the database**
The database will be created automatically when you first run the app.

## 🚀 Running the Application

### Development Mode

**Option 1: Run Frontend and Backend Separately**

Terminal 1 - Run React dev server:
```bash
npm run dev
```
This starts Vite dev server at http://localhost:3000

Terminal 2 - Run Flask backend:
```bash
npm run flask
# or
python app.py
```
This starts Flask server at http://localhost:5000

**Option 2: Build and Run Together**
```bash
npm run build
python app.py
```
Then visit http://localhost:5000

### Production Mode

1. **Build the frontend**
```bash
npm run build
```

2. **Run Flask in production**
```bash
python app.py
```

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Mobile** (320px - 767px)
  - Hamburger menu navigation
  - Single column layouts
  - Touch-optimized controls
  - Optimized typography

- **Tablet** (768px - 1023px)
  - Two-column grid layouts
  - Adaptive navigation
  - Touch and mouse support

- **Desktop** (1024px+)
  - Multi-column layouts
  - Full navigation bar
  - Optimized for productivity

## 🔐 Authentication

The app includes a complete authentication system:

- **Registration**: New user signup
- **Login**: JWT-based authentication
- **Protected Routes**: Automatic redirect for unauthorized access
- **Token Management**: Automatic token refresh and storage

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

## 📁 Project Structure

```
ai-interior-design-flask/
├── frontend/                # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/          # Page components
│       ├── contexts/       # React contexts
│       ├── services/       # API services
│       ├── utils/          # Helper functions
│       ├── App.jsx         # Main app component
│       └── main.jsx        # Entry point
│
├── routes/                 # Flask API routes
│   ├── auth.py            # Authentication endpoints
│   ├── projects.py        # Project management
│   ├── annotations.py     # Annotation features
│   ├── qa.py              # Q&A system
│   └── discussions.py     # Discussion features
│
├── static/                # Static files
│   └── uploads/          # User uploaded files
│
├── dist/                  # Built React app (generated)
├── app.py                # Flask application
├── models.py             # Database models
├── requirements.txt      # Python dependencies
├── package.json          # Node dependencies
└── vite.config.js       # Vite configuration
```

## 🎨 Customization

### Tailwind CSS
Customize colors, fonts, and themes in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### API Configuration
Update API endpoints in `frontend/src/services/api.js`

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run flask        # Start Flask backend

# Production
npm run build        # Build React app
npm start           # Build and run Flask

# Preview
npm run preview     # Preview production build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/upload` - Upload file

### Annotations
- `GET /api/annotations/project/:id` - Get project annotations
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

### Q&A
- `GET /api/qa/project/:id` - Get project questions
- `POST /api/qa` - Create question
- `PUT /api/qa/:id/answer` - Answer question
- `DELETE /api/qa/:id` - Delete question

### Discussions
- `GET /api/discussions/project/:id` - Get discussions
- `POST /api/discussions` - Create message
- `DELETE /api/discussions/:id` - Delete message

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- File upload validation
- Protected API routes

## 📊 Database Schema

- **Users** - User accounts and authentication
- **Projects** - Design projects
- **ProjectFiles** - Uploaded files
- **Annotations** - Drawing annotations
- **Questions** - Q&A system
- **Discussions** - Team discussions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- React team for the amazing UI library
- Flask team for the lightweight web framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of this platform

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ by the AI Interior Design Team

