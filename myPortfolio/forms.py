from email.policy import default
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, EmailField, PasswordField, SubmitField, BooleanField, TextAreaField, SelectField, TelField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from myPortfolio.models import User, Parent, Child
from flask_login import current_user

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=5, max=20)])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), Length(min=8), EqualTo('password')])
    phone = TelField('Phone', validators=[DataRequired()])
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=20)])
    last_name = StringField('Last Name', validators=[Length(max=20)])
    address = TextAreaField('Address')
    submit = SubmitField('Sign Up')
    
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('This username is already taken. Please choose another one.')

    def validate_email(self, email):
        parent = Parent.query.filter_by(email=email.data).first()
        if parent:
            raise ValidationError('This email is already registered with an account. Please go to login')

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=5, max=20)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class RequestResetForm(FlaskForm):
    email = EmailField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Request Password Reset')
    
    def validate_email(self, email):
        parent = Parent.query.filter_by(email=email.data).first()
        if parent is None:
            raise ValidationError('There is no account associated with the email, please check again.')
        
class ResetPasswordForm(FlaskForm):
    account = SelectField('Account', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), Length(min=8), EqualTo('password')])
    submit = SubmitField('Confirm Reset')

class RegisterChildForm(FlaskForm):
    grades = [('p1', 'Primary 1'), ('p2', 'Primary 2'), ('p3', 'Primary 3'), ('p4', 'Primary 4'), ('p5', 'Primary 5'), ('p6', 'Primary 6')]
    username = StringField('Username',
                           validators=[DataRequired(), Length(min=2, max=20)])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password',
                                     validators=[DataRequired(), EqualTo('password')])
    first_name = StringField('First Name',
                           validators=[DataRequired(), Length(min=2, max=20)])
    grade = SelectField('Grade', choices=grades, validators=[DataRequired()])
    submit = SubmitField('Sign Up')

class UpdateParentAccountForm(FlaskForm):
    picture = FileField('Update Profile Picture', validators=[FileAllowed(['jpg', 'png'])])
    username = StringField('Username',
                           validators=[DataRequired(), Length(min=5, max=20)])
    email = EmailField('Email',
                        validators=[DataRequired(), Email()])
    phone = TelField('Phone', validators=[DataRequired()])
    address = TextAreaField('Address')
    submit = SubmitField('Update')

    def validate_username(self, username):
        if username.data != current_user.username:
            user = User.query.filter_by(username=username.data).first()
            if user:
                raise ValidationError('That username is taken. Please choose a different one.')

    def validate_email(self, email):
        parent = Parent.query.filter_by(id=current_user.id).first()
        if email.data != parent.email:
            user = Parent.query.filter_by(email=email.data).first()
            if user:
                raise ValidationError('That email is taken. Please choose a different one.')

class EnrollForm(FlaskForm):
    subject = SelectField('Subject', validators=[DataRequired()])
    priceOptions = SelectField('Price Options')
    submit = SubmitField('Update')

class AddQuestionForm(FlaskForm):
    subjects = [('mat', 'Mathematics'), ('eng', 'English'), ('sci', 'Science')]
    grades = [('p1', 'Primary 1'), ('p2', 'Primary 2'), ('p3', 'Primary 3'), ('p4', 'Primary 4'), ('p5', 'Primary 5'), ('p6', 'Primary 6')]
    subject = SelectField('Subject', choices=subjects,
                           validators=[DataRequired()])
    grade = SelectField('Grade', choices=grades, validators=[DataRequired()])
    qn_txt = TextAreaField('Question')
    qn_pic = FileField('Update Profile Picture', validators=[FileAllowed(['jpg', 'png'])])
    qn_pic_repeatable = BooleanField('Question Pic Repeatable?')
    ans = StringField('Answer', validators=[DataRequired()])
    ans_pic = FileField('Answer Picture', validators=[FileAllowed(['jpg', 'png'])])
    submit = SubmitField('Update')