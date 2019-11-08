"""Models and database functions for App.othecary"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
# from sqlalchemy_utils import PhoneNumber

db = SQLAlchemy()


##############################################################################
# Model definitions

class User(db.Model):
    """User of app"""

    __tablename__= "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    # phone_number = db.Column(db.PhoneNumberType())
    name = db.Column(db.String(50), nullable=False)
    birth_date = db.Column(db.DateTime)
    sex = db.Column(db.String(25))
    diet = db.Column(db.String(25))


class User_Vitamin(db.Model):
    """Vitamins belonging to user's routine"""

    __tablename__ = "user_vitamins"
   
    uv_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    label_id = db.Column(db.String(75), db.ForeignKey('vitamins.label_id'), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), index=True)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean)

    # Define relationship to user
    user = db.relationship("User", backref=db.backref("user_vitamins"))

    # Define relationship to vitamin
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
    # remove once ready to deploy 

    from server import app

    connect_to_db(app)
    print("Connected to DB.")

