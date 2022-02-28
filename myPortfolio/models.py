from myPortfolio import db, login_manager
from datetime import datetime
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(20), nullable=False)
    date_joined = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    image_file = db.Column(db.String(20), nullable=False, default='default.png')
    
    def __repr__(self):
        return f"User('{self.id}', '{self.username}', '{self.first_name}', '{self.role}', '{self.date_joined}')"

class Parent(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    last_name = db.Column(db.String(20), nullable=True)
    phone = db.Column(db.Integer, nullable=False)
    address = db.Column(db.Text, nullable=False)
    children = db.relationship('Child', backref='parent', lazy=True)
    
    def __repr__(self):
        return f"Parent('{self.id}')"

class Child(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('parent.id'), nullable=False)
    grade = db.Column(db.String(2), nullable=False)
    game_characters = db.relationship('Game_Character_Save', backref='child', lazy=True)
    
    def __repr__(self):
        return f"Child('{self.id}')"

class Game_Character_Save(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    game_character = db.Column(db.Text, nullable=False)
    save_date = db.Column(db.DateTime, nullable=False)