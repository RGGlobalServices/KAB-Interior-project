# 🚀 Quick Start Guide - Full Stack React + Flask

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm (comes with Node.js)

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### Step 2: Build the Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 3: Run the Application

```bash
python app.py
```

The application will start at: **http://localhost:5000**

## 🎯 Quick Demo

1. **Visit**: http://localhost:5000
2. **Login with demo credentials**:
   - Email: `demo@example.com`
   - Password: `demo123`
3. **Start exploring!**

## 🛠️ Development Mode

For development with hot-reload:

### Terminal 1 - Frontend Dev Server
```bash
npm run dev
```
Runs at: http://localhost:3000

### Terminal 2 - Backend API
```bash
npm run flask
# or
python app.py
```
Runs at: http://localhost:5000

The frontend dev server will proxy API requests to the backend automatically.

## 📱 Testing Responsiveness

The application is fully responsive. Test it on:

1. **Desktop**: Full screen view
2. **Tablet**: Resize browser to ~768px width
3. **Mobile**: Resize browser to ~375px width
4. **Use DevTools**: Open browser DevTools and toggle device emulation

## 🎨 Key Features to Try

### 1. Project Management
- ✅ Create a new project
- ✅ Upload files (PDF, Excel, Images)
- ✅ View project details
- ✅ Delete projects

### 2. Authentication
- ✅ Register new account
- ✅ Login/Logout
- ✅ Protected routes

### 3. Responsive Design
- ✅ Mobile-friendly navigation
- ✅ Adaptive layouts
- ✅ Touch-optimized controls

## 🔧 Common Tasks

### Build for Production
```bash
npm run build
python app.py
```

### Clear Database and Start Fresh
```bash
# Delete the database file (on Windows)
del interior_design.db

# Delete the database file (on Mac/Linux)
rm interior_design.db

# Restart the app (database will be recreated)
python app.py
```

### Update Dependencies
```bash
# Python
pip install -r requirements.txt --upgrade

# Node.js
npm update
```

## 📂 Project Structure

```
ai-interior-design-flask/
├── frontend/src/           # React source code
│   ├── components/        # UI components
│   ├── pages/            # Page components  
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   └── utils/            # Helper functions
│
├── routes/               # Flask API routes
├── static/uploads/       # Uploaded files
├── dist/                # Built React app (after npm run build)
├── app.py              # Main Flask application
└── models.py           # Database models
```

## 🌐 Available URLs

### Production Mode (after `npm run build`)
- http://localhost:5000 - Main application
- http://localhost:5000/api/health - Health check

### Development Mode
- http://localhost:3000 - React dev server
- http://localhost:5000 - Flask API

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure you've installed all dependencies
```bash
pip install -r requirements.txt
npm install
```

### Issue: Port 5000 already in use
**Solution**: Change the port in `app.py`
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Change to 5001
```

### Issue: Build fails
**Solution**: Clear node_modules and reinstall
```bash
# Windows
rmdir /s /q node_modules
npm install

# Mac/Linux
rm -rf node_modules
npm install
```

### Issue: Database errors
**Solution**: Delete and recreate the database
```bash
# The database will be recreated automatically when you run the app
del interior_design.db  # Windows
rm interior_design.db   # Mac/Linux
python app.py
```

### Issue: Frontend not loading
**Solution**: Make sure you've built the React app
```bash
npm run build
```

## 📊 Default Demo Account

The application creates a demo account automatically:

- **Email**: demo@example.com
- **Password**: demo123
- **Role**: user

You can also create your own account using the registration page.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=development
DATABASE_URL=sqlite:///interior_design.db
```

## 📝 Next Steps

1. ✅ **Customize the design**: Edit Tailwind config in `tailwind.config.js`
2. ✅ **Add features**: Create new components in `frontend/src/components/`
3. ✅ **Extend API**: Add new routes in `routes/` directory
4. ✅ **Deploy**: See `DEPLOYMENT.md` for deployment instructions

## 🆘 Need Help?

- Check `README_FULLSTACK.md` for detailed documentation
- See `DEPLOYMENT.md` for deployment guides
- Check the console for error messages
- Look at browser DevTools Network tab for API errors

## 🎉 You're Ready!

You now have a fully functional, responsive full-stack application with:
- ✅ React frontend with Vite
- ✅ Tailwind CSS for styling
- ✅ Flask backend API
- ✅ JWT authentication
- ✅ Responsive design for all devices
- ✅ File upload functionality
- ✅ Project management system

Happy coding! 🚀

