from flask import render_template, url_for, flash, redirect
from myPortfolio import app

@app.route("/")
@app.route("/home")
def home():
    return render_template('home.html')

@app.route("/about")
def about():
    return render_template('about.html')