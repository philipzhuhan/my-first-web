from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

app = Flask(__name__)
app.config['SECRET_KEY'] = '904f2f19163922f31238fa34fb3a862c'
### for local design
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
### end for local design

### for deployment to Heroku
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://xvzaqevdwvtkpo:d4b0ca73204703ab36a8fd51972f9836ad969323b610762950f06df7b2972ccf@ec2-34-247-151-118.eu-west-1.compute.amazonaws.com:5432/d9g68gci9ao0n4'
### end for deployment to Heroku
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