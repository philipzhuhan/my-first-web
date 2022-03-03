import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
### for local deploy
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
### END for local deploy

### for deploy to Heroku
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL").replace("postgres://", "postgresql://", 1)
### END for deploy to Heroku
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'
admin = Admin(app)

from myPortfolio.models import User, Parent, Child

### for local db
# db.drop_all()
# db.create_all()
# admin_user = User(username='admin', password=bcrypt.generate_password_hash('password').decode('utf-8'), role='admin', first_name='Philip')
# db.session.add(admin_user)
# db.session.commit()
### for local db

from myPortfolio import routes