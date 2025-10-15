"""
Flask extensions initialization
This file prevents circular imports by centralizing extension instances
"""
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

# Initialize extensions (without app)
db = SQLAlchemy()
login_manager = LoginManager()
cors = CORS()

