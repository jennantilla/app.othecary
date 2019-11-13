import requests
import xmltodict
import json

from datetime import timedelta, date

from flask import Flask, redirect, request, render_template, session, flash, jsonify
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

@app.route('/login', methods=["GET"])
def sign_in():
    """Sign in flow for return user"""

    return render_template("login.html")


@app.route('/validate', methods=["POST"])
def log_in():
    """Logs in an existing user"""

    email = request.form.get("email")
    password = request.form.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        flash("We couldn't find you in our records!")
        return redirect("/")

    if user.password_hash != password:
        flash("Your password is incorrect. Please try again")
        return redirect("/")

    session["user_id"] = user.user_id

    return redirect(f"/dashboard/{user.user_id}")


@app.route('/dashboard/<int:user_id>')
def show_dashboard(user_id):
    """Displays user dashboard and vitamin info"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    # returns all the vitamins used by a user
    history = User_Vitamin.query.filter_by(user_id=user_id).all()

    items_routine = {}

    for row in history:
        supply = (int(row.vitamin.net_contents) / 
        int(row.vitamin.serving_size_quantity))

        run_out_date = row.start_date + timedelta(days=supply)
        items_routine[row.vitamin.label_id] = run_out_date

    today = date.today()

    return render_template('dashboard.html',
                            user=user,
                            history=history,
                            today=today,
                            items_routine=items_routine)


@app.route('/register')
def registration_form():
    """Displays user registration page"""

    return render_template("new-user.html")


@app.route('/intake', methods=['POST'])
def new_user_questions():
    """Handles intake questions for new user"""

    name = request.form['name']
    email = request.form['email']
    password_hash = request.form['password']
    birth_date = request.form['birthday']
    sex = request.form['sex']
    diet = request.form['diet']

    user = User(name=name, email=email, password_hash=password_hash, 
                    birth_date=birth_date, sex=sex, diet=diet)

    db.session.add(user)
    db.session.commit()

    return redirect(f"/dashboard/{user.user_id}")


@app.route('/supplements')
def select_supplement():
    """Shows vitamin choices"""

    vitamins = ['Biotin', 'Calcium', 'Choline', 'Copper', 'Folate', 'Iodine', 
    'Iron', 'Magnesium', 'Molybdenum', 'MVMS', 'Niacin', 'Omega3FattyAcids',
    'PantothenicAcid', 'Potassium', 'Probiotics', 'Riboflavin', 'Selenium',
    'Thiamin', 'VitaminA', 'VitaminB12', 'VitaminB6', 'VitaminC',
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
    
    # prevent duplicates:
    # routine = User_Vitamin.query.filter_by(user_id=user_id).all()

    new = User_Vitamin(label_id=label_id, user_id=user_id, active=True)
    
    db.session.add(new)
    db.session.commit()

    return redirect(f'/dashboard/{user_id}')


@app.route('/remove-routine', methods=["POST"])
def remove_routine():
    """Allows user to deprecate a vitamin from their active routine"""

    label_id = request.form.get("remove")
    user_id = session.get("user_id")

    routine = User_Vitamin.query.filter_by(user_id=user_id, label_id=label_id).all()

    for item in routine:
        item.active = False
        flash("Removed from your routine")

    db.session.commit()

    return redirect(f'/dashboard/{user_id}')

@app.route('/restore', methods=["POST"])
def restore_routine():
    """Allows user to restore a vitamin from their deactived routine"""

    label_id = request.form.get("restore")
    user_id = session.get("user_id")

    routine = User_Vitamin.query.filter_by(user_id=user_id, label_id=label_id).all()

    for item in routine:
        item.active = True
        flash("Re-added to your routine")

    db.session.commit()

    return redirect(f'/dashboard/{user_id}')


@app.route('/update-streak.json', methods=["POST"])
def update_streak():
    """Updates user.streak_days based on user input"""

    user_id = session.get("user_id")
    streak = request.form.get("streak")
    user = User.query.filter_by(user_id=user_id).first() 

    if streak == "yes":
        user.streak_days += 1

    if streak == "no":
        user.streak_days = 0

    db.session.commit()

    return jsonify({'streak' : user.streak_days})


@app.route('/logout')
def logout():
    """Logs out current user"""

    del session["user_id"]
    flash("Logged Out")
    return redirect("/")


if __name__ == "__main__":
    app.debug = True

    # Use the DebugToolbar
    DebugToolbarExtension(app)
    connect_to_db(app)
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    app.run(host="0.0.0.0")