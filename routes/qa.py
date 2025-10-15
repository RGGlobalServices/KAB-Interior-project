from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import Question, User, Project, ProjectFile
import threading
import os

qa_bp = Blueprint('qa', __name__)

# Initialize OpenAI client lazily to ensure .env is loaded
def get_openai_client():
    """Get OpenAI client, initializing it if needed"""
    try:
        from openai import OpenAI
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return None
        return OpenAI(api_key=api_key)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None

def generate_ai_response(question_id, app):
    """Generate AI response using OpenAI"""
    with app.app_context():
        try:
            question = Question.query.get(question_id)
            if not question:
                return
            
            # Get OpenAI client
            client = get_openai_client()
            
            # If OpenAI is not configured, use fallback response
            if not client:
                question.answer = "AI features require OpenAI API configuration. This is a simulated response: I can help you with interior design questions about dimensions, materials, color schemes, space planning, and design recommendations. Please configure the OpenAI API key to get intelligent AI-powered responses."
                question.answered = True
                db.session.commit()
                return
            
            # Get project context
            project = Project.query.get(question.project_id)
            if not project:
                question.answer = "Error: Project not found."
                question.answered = True
                db.session.commit()
                return
            
            # Build context from project files
            context = f"Project: {project.name}\nDescription: {project.description or 'No description'}\n\n"
            
            if project.files:
                context += "Uploaded Files:\n"
                for file in project.files:
                    context += f"- {file.name} ({file.file_type})\n"
            
            # Create prompt for OpenAI
            system_prompt = """You are an expert AI assistant for interior design and architecture projects. 
You help analyze floor plans, design documents, and answer questions about dimensions, materials, 
specifications, and design recommendations. Provide detailed, professional answers based on the 
project context provided."""
            
            user_prompt = f"""Project Context:
{context}

User Question: {question.question}

Please provide a detailed, professional answer to this question about the interior design project."""

            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            # Update question with AI response
            question.answer = response.choices[0].message.content
            question.answered = True
            db.session.commit()
            
        except Exception as e:
            print(f"Error generating AI response: {str(e)}")
            question = Question.query.get(question_id)
            if question:
                question.answer = f"I'm here to help with your interior design questions! However, I encountered an issue: {str(e)}. Please try again or rephrase your question."
                question.answered = True
                db.session.commit()

@qa_bp.route('/project/<int:project_id>', methods=['GET'])
@login_required
def get_questions(project_id):
    questions = Question.query.filter_by(project_id=project_id).all()
    return jsonify([q.to_dict() for q in questions]), 200

@qa_bp.route('', methods=['POST'])
@login_required
def ask_question():
    user_id = current_user.id
    data = request.get_json()
    
    project_id = data.get('project_id')
    question_text = data.get('question')
    
    if not all([project_id, question_text]):
        return jsonify({'message': 'Project ID and question are required'}), 400
    
    question = Question(
        project_id=project_id,
        user_id=user_id,
        question=question_text,
        answered=False
    )
    
    db.session.add(question)
    db.session.commit()
    
    # Start AI response generation in background
    from flask import current_app
    thread = threading.Thread(target=generate_ai_response, args=(question.id, current_app._get_current_object()))
    thread.daemon = True
    thread.start()
    
    return jsonify(question.to_dict()), 201

