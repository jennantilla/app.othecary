import requests
import xmltodict
import json

from datetime import timedelta, date, datetime
import calendar

from flask import Flask, redirect, request, render_template, session, flash, jsonify, request_finished
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined

from model import connect_to_db, db, User, User_Vitamin, Vitamin, User_Log

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


@app.route('/dashboard/<int:user_id>', methods=["GET", "POST"])
def show_dashboard(user_id):
    """Displays user dashboard and vitamin info"""

    label_id = request.form.get("remove")
    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    if label_id:
        routine = User_Vitamin.query.filter_by(user_id=user_id, label_id=label_id).first()
        routine.active = False
        routine.discontinue_date = datetime.today()

        db.session.commit()
        flash("Removed from your routine")

    history = User_Vitamin.query.filter_by(user_id=user_id).all()
    items_routine = {}

    for row in history:
        supply = (float(row.vitamin.net_contents) / 
        float(row.vitamin.serving_size_quantity))

        run_out_date = row.start_date + timedelta(days=supply)
        items_routine[row.vitamin.label_id] = run_out_date

    today = datetime.today()
    account_age = today - user.signup_date
    account_age = 2
    # account_age.days


    return render_template('dashboard.html',
                            user=user,
                            history=history,
                            today=today,
                            items_routine=items_routine, 
                            account_age=account_age)


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

    session["user_id"] = user.user_id

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
    filter_type = request.form.get("filter-type")
    search_param = request.form.get("search-param")

    if filter_type == "brand":
        filter_result = Vitamin.query.filter(Vitamin.product_name.like(f"%{vitamin}%"), Vitamin.brand_name.like(f"%{search_param}%")).distinct(Vitamin.product_name).all()

    elif filter_type == "type":
        filter_result = Vitamin.query.filter(Vitamin.product_name.like(f"%{vitamin}%"), Vitamin.supplement_form.like(f"%{search_param}%")).distinct(Vitamin.product_name).all()

    else:
        filter_result = Vitamin.query.filter(Vitamin.product_name.like(f"%{vitamin}%")).distinct(Vitamin.product_name).all()

    # age_group = request.form.get("group")

    return render_template('add-vitamin.html',
                            vitamin=vitamin,
                            filter_result=filter_result)



@app.route('/add-routine', methods=['POST'])
def add_routine():
    """Adds a chosen vitamin to the user's routine"""

    label_id = request.form.get("vitamin")
    user_id = session.get("user_id")
    
    # prevent duplicates:
    routine = User_Vitamin.query.filter_by(user_id=user_id).all()

    ids_for_user = []

    for row in routine:
        ids_for_user.append(row.label_id)

    if label_id not in ids_for_user:

        new = User_Vitamin(label_id=label_id, user_id=user_id, active=True)
        
        db.session.add(new)
        db.session.commit()

    return redirect(f'/dashboard/{user_id}')


# @app.route('/remove-routine.json', methods=["POST"])
# def remove_routine():
#     """Allows user to deprecate a vitamin from their active routine"""

#     label_id = request.form.get("remove")
#     user_id = session.get("user_id")

#     routine = User_Vitamin.query.filter_by(user_id=user_id, label_id=label_id).first()
#     print(routine)
#     routine.active = False
#     routine.discontinue_date = datetime.today()

#     db.session.commit()
#     flash("Removed from your routine")

#     return jsonify({"active" : routine.active})


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
    """Updates success days"""

    user_id = session.get("user_id")
    streak = request.form.get("streak")
    user = User.query.filter_by(user_id=user_id).first()
    
    # today = datetime.today()

    # account_age = user.signup_date.date() - today.date() 

    if streak == "yes":
        user.streak_days += 1
        user.success_rate += 1
        entry = User_Log(user_id=user_id, take_vitamin=True, entry_date=datetime.now().date())

    elif streak == "no":
        user.streak_days = 0
        entry = User_Log(user_id=user_id, take_vitamin=False, entry_date=datetime.now().date())
    
    #check on this
    # user.success_percentage = user.success_rate / int(account_age.days)

    db.session.add(entry)
    db.session.commit()

    return jsonify({'streak' : user.streak_days})  #change to user.success_percentage


@app.route('/success.json')
def success_data():
    """Return data about user success"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    today = datetime.today()
    start_date = user.signup_date

    success_results = User_Log.query.filter_by(user_id=user_id, take_vitamin=True).all()
    fail_results = User_Log.query.filter_by(user_id=user_id, take_vitamin=False).all()

    achieved = len(success_results)
    missed = len(fail_results)

    data_dict = {
                "labels": [
                    "achieved",
                    "missed"
                ],
                "datasets": [
                    {
                        "data": [achieved, missed],
                        "backgroundColor": [
                            "#800080"
                        ],
                    }],
                
            }
    return jsonify(data_dict)


@app.route("/product-type.json")
def get_product_type():
    """Shows product type for each active supplement in user's routine"""

    user_id = session.get("user_id")
    active_vitamins = User_Vitamin.query.filter_by(user_id=user_id, active=True).all()

    product_types = []
      
    for vitamin_type in active_vitamins:
            product_types.append(vitamin_type.vitamin.product_type)

    vita_dict = {
                "labels": [
                    i for i in list(set(product_types))
                ],
                "datasets": [
                    {
                        "data": [product_types.count(i) for i in list(set(product_types))],
                        "backgroundColor": [
                            "#800080",
                            "#320080",
                        ],
                    }]
                
            }

    return jsonify(vita_dict)


@app.route('/check-logged.json')
def check_log():
    """Checks db to see if a user has logged their vitamin intake"""

    user_id = session.get("user_id")
    today = datetime.today().date()
    log = User_Log.query.filter_by(user_id=user_id, entry_date=today).first()
    
    if log:
        entered = True
    else:
        entered = False

    return jsonify({"logged" : entered})


@app.route('/user-vitamin-list.json')
def find_supplements():
    """returns a dictionary of active vitamins and its details"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()
    all_user_vitamins = User_Vitamin.query.filter_by(user_id=user_id).all()

    actives_list = []

    for item in all_user_vitamins: 
        item_info = {}
        item_info["uv_id"] = item.uv_id
        item_info["id"] = item.vitamin.label_id
        item_info["name"] = item.vitamin.product_name
        item_info["serving_size"] = item.vitamin.serving_size_quantity
        item_info["serving_unit"] = item.vitamin.serving_size_unit
        item_info["use"] = item.vitamin.use
        item_info["start_date"] = item.start_date
        item_info["container_amount"] = item.vitamin.net_contents
        item_info["container_unit"] = item.vitamin.net_content_unit
        item_info["active"] = item.active
        actives_list.append(item_info)

    return jsonify(actives_list)


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

    app.run(host="0.0.0.0")