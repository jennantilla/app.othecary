# app.othecary

Full-stack web app that allows a user to research dietary supplements and create a personalized nutrition regimen.

## Tech Stack

Back-end: Python, Flask, PostgreSQL, SQLAlchemy
Front-end: Javascript, jQuery, AJAX, Bootstrap
Data/APIs: National Institutes of Health

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.


### Installing

A step by step series of examples that tell you how to get a development env running

Create a virtual environment in same directory

```
$ virtualenv env
```

Activate virtual environment

```
$ source env/bin/activate
```

Install requirements

```
$ pip3 install -r requirements.txt
```

Create database

```
$ psql supplements
```

Read dumped SQL file into database

```
$ psql supplements < supplements.sql
```

Use the program by running server.py and navingating to localhost port on your browsser

```
$ python3 server.py
```

## V2 Plans

Testing
Improved Suggestion Engine

## V3 Plans
Amazon Add to Cart Form