"""Models and database functions for App.othecary"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


##############################################################################
# Model definitions

class User(db.Model):
    """User of app"""

    __tablename__= "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    phone_number = db.Column(db.String(16), nullable=True)
    name = db.Column(db.String(50), nullable=False)
    birth_date = db.Column(db.DateTime)
    sex = db.Column(db.String(25))
    diet = db.Column(db.String(25))
    signup_date = db.Column(db.DateTime, default=datetime.now)
    success_rate = db.Column(db.Integer, default=0)
    streak_days = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Define relationship to User_Log
    log = db.relationship("User_Log", backref=db.backref("users")) 

class User_Log(db.Model):
    """Daily log of users' vitamin intake"""

    __tablename__ = "user_log"

    log_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    entry_date = db.Column(db.DateTime, default=datetime.now)
    take_vitamin = db.Column(db.Boolean)


class User_Vitamin(db.Model):
    """Vitamins belonging to user's routine"""

    __tablename__ = "user_vitamins"
   
    uv_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    label_id = db.Column(db.String(75), db.ForeignKey('vitamins.label_id'), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    start_date = db.Column(db.DateTime, default=datetime.now)
    discontinue_date = db.Column(db.DateTime)
    active = db.Column(db.Boolean)

    # Define relationship to User
    user = db.relationship("User", backref=db.backref("user_vitamins"))

    # Define relationship to Vitamin
    vitamin = db.relationship("Vitamin", backref=db.backref("user_vitamins"))


class Vitamin(db.Model):
    """Label information for a given vitamin"""

    __tablename__ = "vitamins"

    label_id = db.Column(db.String(75), primary_key=True)
    brand_name = db.Column(db.String(250)) 
    product_name = db.Column(db.String(250))
    net_contents = db.Column(db.String(75))
    net_content_unit = db.Column(db.String(75))
    serving_size_quantity= db.Column(db.String(75))
    serving_size_unit= db.Column(db.String(75))
    product_type= db.Column(db.String(250))
    supplement_form= db.Column(db.String(250))
    dietary_claims= db.Column(db.String(350))
    target_groups= db.Column(db.String(250))
    database= db.Column(db.String(75))
    tracking_history= db.Column(db.String(250))
    use = db.Column(db.String(5000), nullable=True)


##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///supplements'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True
    db.app = app
    db.init_app(app)


if __name__ == "__main__":

    from server import app

    connect_to_db(app)
    print("Connected to DB.")

