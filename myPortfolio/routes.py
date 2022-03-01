import os
import secrets
from PIL import Image
from datetime import date, datetime, timedelta
from flask import render_template, url_for, flash, redirect, request, jsonify
from myPortfolio import app, db, bcrypt, admin
from myPortfolio.forms import RegistrationForm, LoginForm, RegisterChildForm, UpdateParentAccountForm
from myPortfolio.models import User, Parent, Child, Game_Character_Save
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
admin.add_view(MyModelView(Game_Character_Save, db.session))

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
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Login Unsuccessful. Please check username and password', 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route("/dashboard")
@login_required
def dashboard():
    if current_user.role == 'parent':
        parent = Parent.query.filter_by(id=current_user.id).first()
        parentDetail = {
            'username': current_user.username,
            'image_file': url_for('static', filename='img/profile_pics/' + current_user.image_file),
            'first_name': current_user.first_name,
            'last_name': parent.last_name,
            'date_joined': current_user.date_joined,
            'email': parent.email,
            'phone': parent.phone,
            'address': parent.address,
        }
        children = []
        for child in parent.children:
            user = User.query.filter_by(id=child.id).first()
            childObj = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'date_joined': user.date_joined,
                'grade': child.grade,
                'image_file': url_for('static', filename='img/profile_pics/' + user.image_file),
            }
            children.append(childObj)
        return render_template('parent-dashboard.html', parent=parentDetail, children=children)
    return redirect(url_for('home'))

def save_profile_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/img/profile_pics/', picture_fn)
    # resize the picture, with Pillow
    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    #
    i.save(picture_path)

    return picture_fn

@app.route("/account/edit", methods=['GET', 'POST'])
@login_required
def edit_account():
    if (current_user.role == 'parent'):
        parent = Parent.query.filter_by(id=current_user.id).first()
        parentDetail = {
            'username': current_user.username,
            'image_file': url_for('static', filename='img/profile_pics/' + current_user.image_file),
            'first_name': current_user.first_name,
            'last_name': parent.last_name,
            'date_joined': current_user.date_joined,
            'email': parent.email,
            'phone': parent.phone,
            'address': parent.address,
        }
        form = UpdateParentAccountForm()
        if form.validate_on_submit():
            if form.picture.data:
                picture_file = save_profile_picture(form.picture.data)
                current_user.image_file = picture_file
            current_user.username = form.username.data
            current_user.email = form.email.data
            parent.phone = form.phone.data
            parent.address = form.address.data
            db.session.commit()
            flash('Your account has been updated!', 'success')
            return redirect(url_for('dashboard'))
        elif request.method == 'GET':
            form.username.data = current_user.username
            form.email.data = parent.email
            form.phone.data = parent.phone
            form.address.data = parent.address
        return render_template('edit-account.html', title='Edit Account', parent=parentDetail, form=form)
    else:
        return redirect(url_for('dashboard'))

@app.route("/add-child", methods=['GET', 'POST'])
@login_required
def add_child():
    if current_user.role == 'parent':
        form = RegisterChildForm()
        if form.validate_on_submit():
            hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
            user = User(username=form.username.data, password=hashed_password, first_name=form.first_name.data, role='child')
            db.session.add(user)
            db.session.commit()
            child = Child(id=user.id, parent_id=current_user.id, grade=form.grade.data)
            db.session.add(child)
            db.session.commit()
            flash(f'Account created for {form.username.data}! Go ahead to log in', 'success')
            return redirect(url_for('dashboard'))
        return render_template('register-child.html', title='Add Child', form=form)
    return redirect(url_for('dashboard'))

@app.route("/<id>")
@login_required
def view(id):
    user = User.query.filter_by(id=id).first()
    if user:
        if id == current_user.id:
            return redirect(url_for('dashboard'))
        else:
            if user.role == 'child':
                child = Child.query.filter_by(id=user.id).first()
                if current_user.id == child.parent_id:
                    childObj = {
                        'id': user.id,
                        'parent_id': current_user.id,
                        'grade': child.grade,
                        'first_name': user.first_name,
                        'date_joined': user.date_joined,
                        'image_file': url_for('static', filename='img/profile_pics/' + user.image_file),
                    }
                    return render_template('view-child.html', title='Child Detail', child=childObj)
    else:
        return redirect(url_for('home'))

@app.route("/game")
@login_required
def jsGame():
    if current_user.role == 'child':
        return render_template('js-rpg-game.html')
    else:
        return redirect(url_for('dashboard'))

@app.route("/save_progress", methods=['GET', 'POST'])
@login_required
def save_progress():
    req = request.get_json()
    today = date.today()
    #subject = req["subject"]
    question_id = req["qnId"]
    qn = Question.query.filter_by(id=question_id).first()
    subject = qn.subject
    topic = qn.topic
    result = req["result"]
    answer_txt = req["answerTxt"]
    answer_pic = req["answerPic"]
    duration = req["duration"]
    progress = Progress(child_id=current_user.id, date=today, question_id=question_id, subject = subject, topic = topic, result=result, answer_txt = answer_txt, answer_pic = answer_pic, duration=duration)
    db.session.add(progress)
    db.session.commit()
    return "OK"

@app.route("/game/load_characters")
@login_required
def load_characters():
    if current_user.role == 'child':
        saved_character = Game_Character_Save.query.filter_by(child_id=current_user.id).first()
        if saved_character:
            char_object = {
                "id": saved_character.id,
                "character": saved_character.game_character,
            }
            return jsonify(char_object)

@app.route("/game/save_character", methods=['GET', 'POST'])
@login_required
def save_character():
    if current_user.role == 'child':
        req = request.get_json()
        today = datetime.today()
        id = int(req["id"])
        character = req["character"]
        if id == -1:
            char = Game_Character_Save(child_id=current_user.id, game_character=character, save_date=today)
            db.session.add(char)
        else:
            char = Game_Character_Save.query.filter_by(id=id).first()
            if today > char.save_date:
                char.game_character = character
                char.save_date = today
        db.session.commit()
        return 'OK'