import os
import secrets
from PIL import Image
from datetime import date, datetime, timedelta
from flask import render_template, url_for, flash, redirect, request, jsonify
from myPortfolio import app, db, bcrypt, admin
from myPortfolio.forms import RegistrationForm, LoginForm, RegisterChildForm, UpdateParentAccountForm, AddQuestionForm
from myPortfolio.models import User, Parent, Child, Game_Character_Save, Question, Progress, DailyProgress, MonthlyProgress
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
admin.add_view(MyModelView(Progress, db.session))
admin.add_view(MyModelView(DailyProgress, db.session))
admin.add_view(MyModelView(MonthlyProgress, db.session))

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

def save_qn_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/img/questions/', picture_fn)
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
                    progressRecord = []
                    dailyProgressRecord = []
                    progressList = Progress.query.filter_by(child_id=child.id).all()
                    dailyProgressList = DailyProgress.query.filter_by(child_id=child.id).all()
                    childObj = {
                        'id': user.id,
                        'parent_id': current_user.id,
                        'grade': child.grade,
                        'first_name': user.first_name,
                        'date_joined': user.date_joined,
                        'image_file': url_for('static', filename='img/profile_pics/' + user.image_file),
                    }
                    for progress in progressList:
                        progressObj = {
                            'date': progress.date,
                            'subject': progress.subject,
                            'operation': progress.operation,
                            'question': progress.question,
                            'correct_ans': progress.correct_ans,
                            'ans_chosen': progress.ans_chosen,
                            'result': progress.result,
                            'duration': progress.duration,
                        }
                        progressRecord.append(progressObj)
                    for progress in dailyProgressList:
                        progressObj = {
                            'date': progress.date,
                            'subject': progress.subject,
                            'operation': progress.operation,
                            'question': progress.question,
                            'total_attempted': progress.total_attempted,
                            'ans_correct': progress.ans_correct,
                            'avg_duration': progress.avg_duration,
                        }
                        dailyProgressRecord.append(progressObj)
                    return render_template('view-child.html', title='Child Detail', child=childObj, progress=progressRecord, dailyProgress = dailyProgressRecord)
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
    subject = req["subject"]
    result = req["result"]
    operation = req["operation"]
    question = req["question"]
    correctAnswer = req["correctAnswer"]
    ansChosen = req["ansChosen"]
    duration = req["duration"]
    progress = Progress(child_id=current_user.id, subject=subject, result=result, operation=operation, question=question, correct_ans=correctAnswer, ans_chosen=ansChosen, duration=duration)
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
                'id': saved_character.id,
                'character': saved_character.game_character,
            }
            return jsonify(char_object)
        else:
            char_object = {
                'id': -1,
                'character': -1,
            }
            return jsonify(char_object)

@app.route("/game/save_character", methods=['GET', 'POST'])
@login_required
def save_character():
    if current_user.role == 'child':
        req = request.get_json()
        today = datetime.today()
        id = req["id"]
        character = req["character"]
        if id == -1:
            char = Game_Character_Save(child_id=current_user.id, game_character=character, save_date=today)
            db.session.add(char)
        else:
            char = Game_Character_Save.query.filter_by(id=id).first()
            char.game_character = character
            char.save_date = today
        db.session.commit()
        return 'OK'

@app.route("/admin/add-question", methods=['GET', 'POST'])
@login_required
def add_question():
    if current_user.role == 'admin':
        form = AddQuestionForm()
        if form.validate_on_submit():
            if form.qn_pic.data:
                qn_pic = save_profile_picture(form.qn_pic.data)
            if form.qn_pic.data:
                ans_pic = save_profile_picture(form.ans_pic.data)
            qn = Question(subject=form.subject.data, grade=form.grade.data, qn_txt=form.qn_txt.data, qn_pic=qn_pic, qn_pic_repeatable=form.qn_pic_repeatable.data, ans=form.ans.data, ans_pic=ans_pic)
            db.session.add(qn)
            db.session.commit();
            flash("new question added: " + qn.subject + " / " + qn.grade)
            return redirect(url_for(add_question))
        return render_template('add-question.html', title='Add Question', form=form)
    return redirect(url_for('dashboard'))

@app.route("/admin/clean-progress", methods=['GET', 'POST'])
@login_required
def clean_progress():
    if current_user.role == 'admin':
        progressRecords = Progress.query.all();
        for record in progressRecords:
            dateOfRecord = record.date.date()
            if dateOfRecord < datetime.today().date():
                dailyRecord = DailyProgress.query.filter_by(child_id=record.child_id, date=dateOfRecord, subject=record.subject, operation = record.operation).first()
                if dailyRecord:
                    dailyRecord.total_attempted += 1
                    dailyRecord.avg_duration = (dailyRecord.avg_duration * dailyRecord.total_attempted + record.duration) / dailyRecord.total_attempted
                    if record.result == True:
                        dailyRecord.ans_correct += 1
                else:
                    if record.result:
                        ans_correct = 1
                    else:
                        ans_correct = 0
                    dailyRecord = DailyProgress(child_id=record.child_id, date=dateOfRecord, subject=record.subject, operation=record.operation, total_attempted=1, ans_correct=ans_correct, avg_duration=record.duration)
                    db.session.add(dailyRecord)
                db.session.delete(record)
                db.session.commit()
        dailyRecords = DailyProgress.query.all();
        print(datetime.today().year)
        for record in dailyRecords:
            yearOfRecord = record.date.year;
            monthOfRecord = record.date.month;
            print(type(monthOfRecord))
            print(yearOfRecord)
            print(monthOfRecord)
        return redirect(url_for('dashboard'))
    else:
        return redirect(url_for('dashboard'))