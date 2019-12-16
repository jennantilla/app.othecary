# app.othecary

Full-stack web app that allows a user to research dietary supplements and create a personalized nutrition regimen.

## Tech Stack

Back-end: Python, Flask, PostgreSQL, SQLAlchemy   
Front-end: Javascript, jQuery, AJAX, Bootstrap   
Data/APIs: National Institutes of Health   

## Features
Interactive search page that filters based on product name, type, brand name, dosage size
![ScreenShot](https://raw.github.com/jennantilla/app.othecary/master/static/images/search.png)

Supplement info modal with supplement details and run-out calculator
![ScreenShot](https://raw.github.com/jennantilla/app.othecary/master/static/images/info.png)

User dashboard with regimen, streak counter, log lookup, and suggested supplements
![ScreenShot](https://raw.github.com/jennantilla/app.othecary/master/static/images/dashboard.png)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.


### Installing

A step by step series of examples that tell you how to get the development environment running

Create a virtual env in same directory

```
$ virtualenv env
```

Activate virtual env

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

Use the program by running server.py and navingating to localhost port on your browser

```
$ python3 server.py
```

## V2 Plans

Testing
Improved Suggestion Engine

## V3 Plans
Amazon Add to Cart Form