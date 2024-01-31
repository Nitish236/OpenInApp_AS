# MERAKAL_AS

<!-- ABOUT THE PROJECT -->

## About The Project

As per the Assignment

Each of the API is created and distributed :

1. Authorization (Log In, Log Out)

2. Users (Create User, Get User(Logged In))

3. Tasks (Create a Task, Get All User Task, Update Task, Delete Task)

4. Sub Tasks (Create a Sub Task, Get All Sub Task, Update Sub Task, Delete Sub Task)

<!-- GETTING STARTED -->

## Getting Started

Clone the Github Repo and follow these steps.

### Prerequisites

npm is needed to run the software and node(download from official website).

Run below code in your CMD or in VS code CMD

- npm

```sh
  npm install npm@latest -g
```

### ENV

Below is the .env file

```sh
# Change the below Credentials as needed

# Database credentials Change the below Credentials as needed
# Database credentials (Valid for 15 days)
DB_USER = "oa_app"
DB_PASS = "Gz2UoQETZwQ9mkrZ"
CLUSTER = "projectscluster.ayghr6i."
DB_NAME = "OA"

# Twilio credentials
TWILIO_ACCOUNT_SID = "AC5e111a9f21b85f958a8b83e581b2c7de"
TWILIO_TOKEN = "ee1e7b6dc7e86c8ba1510ae4ae233d99"
TWILIO_PHONE_NUMBER = "+13413488798"

# Cron Jobs schedules Time
UPDATE_PRIORITY_TIME = "12 18 * * *"
VOICECALL_TIME = "13 18 * * *"

# Secret Key
JWT_SECRET_KEY = "D(G+KaPdSgVkYp3s6v9y$B&E)H@McQeT"
JWT_TOKEN_EXPIRY = "1d"

# Port number
PORT = 3000

# Node version
NODE_VERSION = 20.10.0

# Node env
NODE_ENV = "development"
```

Note :

1. Change the Twilio credentials as the free account only allows to call on verified numbers. (To use your phone number in as a user in the project you need to do this else you cannot make calls)
2. DB credentials are valid for 15 days from the date of creation.
3. The Cron Job Time, change them from the .env file as needed.

### Steps

1. cd into the OPENINAPP_AS

```sh
  cd .\OPENINAPP_AS\
```

2. Install NPM packages

```sh
npm install
```

3. Now run the below command to run the server and server will be running on localhost:3000

3.1. Use this code if you want to run it using nodemon

```sh
npm run dev
```

3.2. Use this code if you want to run it using node

```sh
npm run start
```

4. Your Server would be running on

```
http://localhost:3000
```

5. To stop the server just `ctrl + c` in your terminal.

## Usage Instructions

1. Create a User account using your Phone number.
2. Log In using that number.
3. Then Do the task as you wish.

-> The token and cookie is taken care of by using global variables.
-> You don't need to send them with every request, they are automatically added for you.
-> The New Task Id, Sub Task Id also get's updated in globals when you create a new one.

## POSTMAN

<!-- Postman -->

Note :
In postman there is a variable local_URL that is the localhost:3000. Use POSTMAN desktop to use the it.

Postman Invite Link : [POSTMAN Invite Link](https://app.getpostman.com/join-team?invite_code=71db606dcbd72bce542bbc3dabdb1f5e&target_code=4bad3f8d51bd6227172acb0abe56fc85)

It is a public workspace that you can visit, Join it and test the API's
