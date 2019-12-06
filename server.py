import random

import requests
import xmltodict
import json

from datetime import timedelta, date, datetime
from dateutil.relativedelta import relativedelta
import calendar

from flask import Flask, redirect, request, render_template, session, flash, jsonify, request_finished
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined

from sqlalchemy import func

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


@app.route('/dashboard/<int:user_id>')
def show_dashboard(user_id):
    """Displays user dashboard and vitamin info"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    history = User_Vitamin.query.filter_by(user_id=user_id).all()
    log = User_Log.query.filter_by(user_id=user_id).all()

    today = datetime.today()

    user_age = relativedelta(today, user.birth_date)
    user_age = user_age.years

    account_age = today - user.signup_date
    account_age = account_age.days

    if account_age < 1:
        account_age = 1

    req = requests.get("https://ods.od.nih.gov/api/?resourcename=DietarySupplements&readinglevel=Health%20Professional&outputformat=XML")
    doc = xmltodict.parse(req.content)

    title = doc['Factsheet']['ShortTitle']
    body = doc['Factsheet']['Content']


    return render_template('dashboard.html',
                            user=user,
                            user_age=user_age,
                            history=history,
                            log=log,
                            today=today, 
                            account_age=account_age,
                            title=title,
                            body=body)


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


@app.route('/update-streak', methods=["POST"])
def update_streak():
    """Updates success days"""

    user_id = session.get("user_id")
    streak = request.form.get("streak")
    notes = request.form.get("notes")
    user = User.query.filter_by(user_id=user_id).first()

    if streak == "yes":
        user.streak_days += 1
        user.success_rate += 1
        entry = (User_Log(user_id=user_id, take_vitamin=True, 
                            entry_date=datetime.now().date(), user_notes=notes))

    elif streak == "no":
        user.streak_days = 0
        entry = (User_Log(user_id=user_id, take_vitamin=False, 
                            entry_date=datetime.now().date(), user_notes=notes))

    db.session.add(entry)
    db.session.commit()

    return redirect(f'/dashboard/{user_id}')


@app.route('/user_log.json', methods=["GET"])
def get_user_log():
    """Displays notes information from user log"""

    search = request.args.get("search_terms")
    user_id = session.get("user_id")
    log = (User_Log.query.filter(User_Log.user_notes!=None, User_Log.user_id==user_id, User_Log.user_notes.
                    ilike(f"%{search}%")).all())

    log_results = ({"results": [{"id": item.log_id, "text": f"{item.entry_date.strftime('%B %d, %Y')}"} for item in log]})

    return jsonify(log_results)


@app.route('/see-log.json', methods=["POST"])
def show_log_info():
    """Displays info for selected vitamin"""

    chosen_items = request.form.getlist("log-results[]")

    log_list = []

    for item in chosen_items:
        selected_log_details = {}
        info = User_Log.query.filter_by(log_id=item).first()
        selected_log_details['id'] = info.log_id
        selected_log_details['date'] = info.entry_date.strftime('%B %d, %Y')
        selected_log_details['take_vitamin'] = info.take_vitamin
        selected_log_details['notes'] = info.user_notes
        log_list.append(selected_log_details)
    
    return jsonify(log_list)


@app.route('/user_ratings.json', methods=["POST"])
def update_ratings():
    """Updates a rating for a supplement in the db"""

    rating = request.form.get("rating")
    label_id = request.form.get("id")

    user_id = session.get("user_id")

    user_record = User_Vitamin.query.filter_by(user_id=user_id, label_id=label_id).first()

    user_record.user_rating = rating
    db.session.commit()

    return redirect(f'/dashboard/{user_id}')


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
    
    return render_template(f'vit-info.html',
                            title=title,
                            body=body,
                            vitamin=vitamin)


@app.route('/search-page')
def display_search():
    """Display search page"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    user_suggestion_list = ["Iron", "Calcium", "VitaminC"]

    if user.diet == "vegetarian":
        user_suggestion_list.extend(["VitaminB12"])
    if user.sex == "female":
        user_suggestion_list.extend(["Folate"])
    elif user.sex == "male":
        user_suggestion_list.extend(["Zinc", "Magnesium"])

    personal_suggestions = random.sample(user_suggestion_list, k=3)

    suggestion = []

    for item in personal_suggestions:
        r = requests.get("https://ods.od.nih.gov/api/?resourcename=" + item + 
                                    "&readinglevel=Consumer&outputformat=XML")
    
        doc = xmltodict.parse(r.content)
        body = doc['Factsheet']['Content'][:290]
        pairs = tuple([item, body])
        suggestion.append(pairs)

    return render_template('search-add.html',
                    suggestion=suggestion)


@app.route('/vitamin-search.json', methods=["GET"])
def vitamin_search():
    """Provide result of filtered vitamins"""
    
    search = request.args.get("search_terms")

    product = (Vitamin.query.filter(Vitamin.product_name.ilike(f"%{search}%"))
                                        .distinct(Vitamin.product_name).all())

    product_results = ({"results": [{"id": item.label_id, 
        "text": item.product_name} for item in product]})

    return jsonify(product_results)


@app.route('/see-info.json', methods=["POST"])
def see_vitamin_info():
    """Displays info for selected vitamin"""

    chosen_item = request.form.get("selected-item")

    info = Vitamin.query.filter_by(label_id=chosen_item).first()

    selected_product_details = {}

    selected_product_details['brand'] = info.brand_name
    selected_product_details['name'] = info.product_name
    selected_product_details['contents'] = info.net_contents + " " + info.net_content_unit
    selected_product_details['use'] = info.use
    selected_product_details['serving'] = info.serving_size_quantity + " " + info.serving_size_unit
    selected_product_details['product_type'] = info.product_type
    selected_product_details['supplement_form'] = info.supplement_form
    selected_product_details['group'] = info.target_groups
    selected_product_details['id'] = info.label_id

    return jsonify(selected_product_details)


@app.route('/calculator.json', methods=['POST'])
def calculate_run_out():
    """Calculate run-out date for vitamin"""

    label_id = request.form['label-id']
    content = request.form['supp-content']
    serv_form = request.form['serv-form']
    start = request.form['date']
    amount = float(request.form['cust-serv-amt'])
    servs_day = float(request.form['cust-serv-freq'])

    start_obj = datetime.strptime(start, '%Y-%m-%d')

    content = content.split(" ")
    content_amt = float(content[0])

    # calculations based on ounces (e.g., 2 tbsps per ounce)
    if serv_form == "tsp":
        daily_serving = (6 * amount) * servs_day

    elif serv_form == "tbsp":
        daily_serving = (2 * amount) * servs_day

    elif serv_form == "gram":
        daily_serving = (28.35 * amount) * servs_day 

    elif serv_form == "unit":
        daily_serving = amount * servs_day

    supply = content_amt / daily_serving
    run_out_date = start_obj + timedelta(days=supply)

    return jsonify({"run-out": run_out_date})


@app.route('/add-routine', methods=['POST'])
def add_routine():
    """Adds a chosen vitamin to the user's routine"""

    label_id = request.form.get('target-vit')
    run_out_date = request.form.get("run-out")
    user_id = session.get("user_id")

    # prevent duplicates:
    routine = User_Vitamin.query.filter_by(user_id=user_id).all()
    ids_for_user = []

    for row in routine:
        ids_for_user.append(row.label_id)

    if label_id not in ids_for_user:

        new = User_Vitamin(label_id=label_id, user_id=user_id, active=True, run_out_date=run_out_date)
        
        db.session.add(new)
        db.session.commit()

    flash(f"{new.vitamin.product_name} was added to your routine!")

    return redirect(f'/dashboard/{user_id}')


@app.route('/remove-routine.json', methods=["POST"])
def remove_routine():
    """Allows user to deativate a vitamin from their active routine"""

    label_id = request.form

    for key in label_id:
        my_value = key

    user_id = session.get("user_id")

    routine = (User_Vitamin.query.filter_by(user_id=user_id, 
                                label_id=my_value).first())
    
    if routine.active == True:
        routine.active = False
        routine.discontinue_date = datetime.today()

    else:
        routine.active = True
        routine.start_date = datetime.today()

    db.session.commit()

    return redirect(f'/dashboard/{user_id}')
    # return jsonify({"active" : routine.active})


@app.route('/success.json')
def success_data():
    """Return data about user success"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    today = datetime.today()
    start_date = user.signup_date

    success_results = (User_Log.query.filter_by(user_id=user_id, 
                                    take_vitamin=True).all())
    fail_results = (User_Log.query.filter_by(user_id=user_id, 
                                    take_vitamin=False).all())

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
                            "#320080"
                        ],
                    }],
                
            }
    return jsonify(data_dict)


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
    """Returns a dictionary of active vitamins and its details"""

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
        item_info["discontinue_date"] = item.discontinue_date
        item_info["container_amount"] = item.vitamin.net_contents
        item_info["container_unit"] = item.vitamin.net_content_unit
        item_info["active"] = item.active
        item_info["run_out"] = item.run_out_date
        item_info["rating"] = item.user_rating
        actives_list.append(item_info)

    return jsonify(actives_list)


@app.route("/suggestions.json", methods=["GET"])
def create_suggestions():
    """Curates supplements the user may be interested in based on user profile"""

    user_id = session.get("user_id")
    user = User.query.filter_by(user_id=user_id).first()

    # existing_trends = User_Vitamin.query.filter_by(user_id=user_id, active="true").all()

    # preferred_brands = set()

    # for info in existing_trends:
    #     preferred_brands.add(info.vitamin.brand_name)

    if user.sex == "female":
            # tuple of all custom keywords
            important_vitamins = ("folate", "folic acid", "women", "female", user.diet)

    if user.sex == "male":
            important_vitamins = ("coq10", "omega-3", "saw palmetto", " men's", user.diet)

    # print all the distinct products that have either thing in their product name
    query = Vitamin.query.filter(Vitamin.product_name.ilike(f"%{important_vitamins[0]}%") | Vitamin.product_name.ilike(f"%{important_vitamins[1]}%") | Vitamin.product_name.ilike(f"%{important_vitamins[2]}%") | Vitamin.product_name.ilike(f"%{important_vitamins[3]}%")| Vitamin.product_name.ilike(f"%{important_vitamins[4]}%")).distinct(Vitamin.product_name).all()
    
    personalized_list = []
    
    for item in query:
        product_suggestions = {}

        product_suggestions['id'] = item.label_id
        product_suggestions['name'] = item.product_name
        product_suggestions['use'] = item.use
        personalized_list.append(product_suggestions)

    featured = random.choice(personalized_list)

    return jsonify(featured)


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