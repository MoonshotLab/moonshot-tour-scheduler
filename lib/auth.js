var needle = require('needle');
var config = require('../config')();
var Q = require('q');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var db = require('./db');


var standardStrategy = new GoogleStrategy(
  {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_SECRET,
    callbackURL: config.ROOT_URL + '/schedule'
  },
  function(accessToken, refreshToken, params, profile, done){
    var allowedDomains = ['barkleyus.com', 'blacktopcreative.com', 'crossroads.us', 'thefuturecast.com'];
    var passes = false;

    try{
      var hd = profile._json.hd;
      if(allowedDomains.indexOf(hd) != -1)
        passes = true;
    } catch(e){}

    if(passes) done(null, profile);
    else done("Not Allowed", {});
  }
);


var labStrategy = new GoogleStrategy(
  {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_SECRET,
    callbackURL: config.ROOT_URL + '/oauth2callback'
  },
  function(accessToken, refreshToken, params, profile, done){
    var user = profile;
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;

    db.upsertUser(user).then(function(err, newUser){
      done(null, user);
    }).catch(function(err){
      console.log('error upserting user', e);
    });
  }
);


passport.serializeUser(function(user, done){
  done(null, user);
});


passport.deserializeUser(function(user, done){
  if(user) done(null, user);
  else done('Not a valid session', null);
});


passport.use('lab', labStrategy);
passport.use('standard', standardStrategy);


exports.getNewAccessToken = function(user){
  var deferred = Q.defer();

  var postData = [
    'refresh_token=' + user.refreshToken,
    'client_id=' + config.GOOGLE_CLIENT_ID,
    'client_secret=' + config.GOOGLE_SECRET,
    'grant_type=refresh_token'
  ].join('&');

  needle.post(
    'https://accounts.google.com/o/oauth2/token',
    postData,
    function(err, res, body){
      if(!err && body && body.access_token){
        user.accessToken = body.access_token;
        db.upsertUser(user);
        deferred.resolve(user);
      }
    }
  );

  return deferred.promise;
};


exports.passport = passport;
