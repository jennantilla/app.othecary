import requests
import xmltodict
import json

from flask import Flask, redirect, request, render_template, session
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined

from model import connect_to_db, db, User, User_Vitamin, Vitamin

app = Flask(__name__)
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True

app.secret_key = 'ABC'

@app.route('/')
def homepage():
    """Displays homepage and sign-in/login info"""

    return render_template("home.html")


@app.route('/login', methods=['POST'])
def log_in():
    """Logs in an existing member"""

    email = request.form.get("email")
    password = request.form.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        flash("We couldn't find you in our records!")
        return redirect("/")

    if user.password != password:
        flash("Your password is incorrect. Please try again")
        return redierct("/")

    session["user_id"] = user.user_id

    return redirect(f"/dashboard/{user.user_id}")


@app.route('/dashboard/<int:user_id>')
def show_dashboard(user_id):
    """Display user dashboard and vitamin info"""

    user = session.get("user_id")
    routine = User_Vitamin.query.all()

    return render_template('dashboard.html',
                            user=user,
                            routine=routine)


@app.route('/register', methods=['POST'])
def registration_form():
    """Displays user registration page"""

    return render_template("new-user.html")


@app.route('/intake', methods=['POST'])
def new_user_questions():
    """intake questions for new user"""

    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    birth_date = request.form['birthday']
    sex = request.form['sex']
    diet = request.form['diet']

    new_user = User(name=name, email=email, password=password, 
                    birth_date=birth_date, sex=sex, diet=diet)

    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.user_id

    return redirect("/dashboard/<int:user_id>")


@app.route('/supplements')
def select_supplement():
    """Shows vitamin choices"""
    vitamins = ['Biotin', 'Calcium', 'Choline', 'Copper', 'Folate', 'Iodine', 
    'Iron', 'Magnesium', 'Molybdenum', 'MVMS', 'Niacin', 'Omega3FattyAcids',
    'PantothenicAcid', 'Potassium', 'Probiotics', 'Riboflavin', 'Selenium',
    'Thiamin', 'Valerian', 'VitaminA', 'VitaminB12', 'VitaminB6', 'VitaminC',
    'VitaminD', 'VitaminE', 'VitaminK', 'WeightLoss', 'Zinc']
    
    return render_template('supplements.html',
        vitamins=vitamins)


@app.route('/lookup', methods=['POST'])
def look_up_fact_sheet():
    """Looks up the fact sheet for chosen supplement"""
    
    vitamin = request.form.get("vitamin")

    r = requests.get("https://ods.od.nih.gov/api/?resourcename=" + vitamin + 
        "&readinglevel=Consumer&outputformat=XML")
    
    doc = xmltodict.parse(r.content)
    title = doc['Factsheet']['Title']
    body = doc['Factsheet']['Content']
    
    return render_template('vit-info.html',
                            title=title,
                            body=body,
                            vitamin=vitamin)


@app.route('/vitamin-search', methods=['POST'])
def search_vitamins():
    """Provides a list of similar vitamins"""
    
    vitamin = request.form.get("vitamin")
    
    search_result = Vitamin.query.filter(Vitamin.product_name.like(f"%{vitamin}%")).all()

    brand = request.form.get("brand")
    # supplement_type = request.form.get("type")
    # age_group = request.form.get("group")


    return render_template('add-vitamin.html',
                            vitamin=vitamin,
                            search_result=search_result,
                            brand=brand)


@app.route('/add-routine', methods=['POST'])
def add_routine():
    """Adds a chosen vitamin to the user's routine"""

    label_id = request.form.get("vitamin")
    user_id = session.get("user_id")

    new = User_Vitamin(label_id=label_id, user_id=user_id, active=True)

    db.session.add(new)
    db.session.commit()

    return render_template('/dashboard.html')


@app.route('/logout')
def logout():
    """Logs current user out"""

    del session["user_id"]
    flash("Logged Out.")
    return redirect("/")


if __name__ == "__main__":
    app.debug = True

    # Use the DebugToolbar
    DebugToolbarExtension(app)
    connect_to_db(app)

    app.run(host="0.0.0.0")