var Q = require('q');
var config = require('../config')();
var MongoClient = require('mongodb').MongoClient;
var user = null;

MongoClient.connect(
  config.DB_CONNECT,
  function(err, db){
    if(err) throw err;

    user = db.collection('user');
  }
);


exports.getAllUsers = function(){
  var deferred = Q.defer();

  user.find({}).toArray(function(err, docs){
    if(err) deferred.reject(err);
    else deferred.resolve(docs);
  });

  return deferred.promise;
};


exports.upsertUser = function(userOpts){
  var deferred = Q.defer();

  // the profile photo doesn't come back in the
  // standard response, must fetch from the json object
  var pic = userOpts._json.picture;

  // ensure these google properties don't get written
  // to the db
  delete userOpts._raw;
  delete userOpts._json;

  // um... save it again i guess
  userOpts.picturePath = pic;

  user.update(
    { id: userOpts.id },
    { $set: userOpts },
    { upsert: true },

    function(err, newUser, stats){
      if(!err){
        if(stats.updatedExisting)
          console.log('Updated user', userOpts.displayName);
        else
          console.log('Created new user', userOpts.displayName);

        deferred.resolve(newUser);
      }
    }
  );

  return deferred.promise;
};


exports.findUser = function(email){
  var deferred = Q.defer();

  user.findOne({
    emails: { $in: [{value: email}] }
  }, function(err, foundUser){
    deferred.resolve(foundUser);
  });

  return deferred.promise;
};
