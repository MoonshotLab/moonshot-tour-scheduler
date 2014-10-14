# Moonshot Tour Scheduler

## Rest Routes
User calendars can be consumed via rest routes with the pattern `partner/:email-address`. Query params can be passed to limit the amount of items returned, `partner/:email-address?location&floor`

## Authenticating
To be tracked by the scheduler, you need to first hit the authentication route (does not yet exist). This will build a user record with an oAuth2 access and refresh token.

## Environment Variables
* `ROOT_URL` - Used for the google auth callback
* `DB_CONNECT` - The Full mongo connection string: `mongodb://{mongo_username}:{mongo_password}@{mongo_url}`
* `GOOGLE_CLIENT_ID` - Google app client id
* `GOOGLE_SECRET` - Google app secret
