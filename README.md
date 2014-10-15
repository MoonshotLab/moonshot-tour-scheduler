# Moonshot Tour Scheduler
A simple scheduling system which helps Barkley partners book tours for the lab.

## Authenticating
To use the scheduler, you need to have an e-mail address with the domain [http://barkleyus.com](barkleyus.com).

To be tracked by the scheduler, you need to first hit the authentication route at `/auth`. This will build a user record with an oAuth2 access and refresh token which will automatically update any time data is requested.

## Rest Routes
* `/auth` - Authorize the current user and add them to the list of lab members
* `/users` - List all the lab members
* `/isBusy/:email-address` - Get the free busy information of a pre authorized user

## Environment Variables
Set these up before running the application:
* `ROOT_URL` - Used for the google auth callback
* `DB_CONNECT` - The Full mongo connection string: `mongodb://{mongo_username}:{mongo_password}@{mongo_url}`
* `GOOGLE_CLIENT_ID` - Google app client id
* `GOOGLE_SECRET` - Google app secret
