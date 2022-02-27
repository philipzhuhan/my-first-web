from flask import render_template, url_for, flash, redirect, request
from myPortfolio import app, db, bcrypt, admin
from myPortfolio.forms import RegistrationForm, LoginForm
from myPortfolio.models import User, Parent, Child
from flask_login import login_user, logout_user, current_user, login_required
from flask_admin.contrib.sqla.view import ModelView

class MyModelView(ModelView):
    column_display_pk = True # display Primary Key
    column_hide_backrefs = False # display Back Ref (e.g. parent of child in Child table)

    def is_accessible(self):
        if current_user.role == 'admin':
            return True
        return False

admin.add_view(MyModelView(User, db.session))
admin.add_view(MyModelView(Parent, db.session))
admin.add_view(MyModelView(Child, db.session))

@app.route("/")
@app.route("/home")
def home():
    return render_template('home.html')

@app.route("/about")
def about():
    return render_template('about.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, password=hashed_password, first_name=form.first_name.data, role='parent')
        db.session.add(user)
        db.session.commit()
        parent = Parent(id=user.id, email=form.email.data, last_name=form.last_name.data, phone=form.phone.data, address=form.address.data)
        db.session.add(parent)
        db.session.commit()
        flash(f'Account created for {user.first_name}!', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Login Unsuccessful. Please check username and password', 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route("/game")
def jsGame():
    return render_template('js-rpg-game.html')