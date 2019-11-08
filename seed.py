"""Utility file to seed vitamins database from NIH data in seed/data"""

from sqlalchemy import func

from model import User, Vitamin, User_Vitamin, connect_to_db, db
from server import app

import csv
import requests
import json

def load_labels():
    """Load vitamin labels from lstProducts.csv into database"""

    with open("seed_data/lstProducts.csv") as vit:
        reader = csv.reader(vit)
        # row_num = 1  #use for testing?
        for row in reader:
            vitamin = Vitamin(label_id=row[0],
                        brand_name=row[1], 
                        product_name=row[2],
                        net_contents=row[3], 
                        net_content_unit=row[4],
                        serving_size_quantity=row[5],
                        serving_size_unit=row[6], 
                        product_type=row[7], 
                        supplement_form=row[8], 
                        dietary_claims=row[9], 
                        target_groups=row[10], 
                        database=row[11], 
                        tracking_history=row[12])

            db.session.add(vitamin)
            # row_num += 1  
            # print(row_num, row) use for testing?

    db.session.commit()


def update_labels_directions():
    """Add directions field to Vitamin db"""

    labels = Vitamin.query.all()
    # label_1 = labels[:1000:5000]
    label_2 = labels[5000:10000]
    label_3 = labels[10000:20000]
    
    for product in label_3:
        vit_id = product.label_id
        r = requests.get('http://dsld.nlm.nih.gov/dsld/api/label/' + vit_id)
        vitamin = r.json()

        try:

            directions = vitamin['Suggested_Use']

        except KeyError:
            print(vitamin)
            import pdb; pdb.set_trace()
            
        if directions: 
            product.use = directions

    db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()

    # load_labels()
    update_labels_directions()