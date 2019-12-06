from unittest import TestCase
from server import app


class FlaskTests(TestCase):
    def setUp(self):
        """Sets up test"""

        self.client = app.test_client()
        app.config['TESTING'] = True

        connect_to_db(app, "postgresql:///testdb")

        db.create_all()
        example_data

    def tearDown(self):
        """Post-test"""
        db.session.close()
        db.drop_all()

    def test_login_route(self):
        """Tests login"""

        result = self.client.post("/login",
            data={"user_id": "1", "password": "123"},
            follow_redirects=True)

        self.assertIn(b"You're my favorite user", result.data)