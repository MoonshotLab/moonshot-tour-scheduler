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


exports.upsertUser = function(userOpts){
  var deferred = Q.defer();

  // ensure these google properties don't get written
  // to the db
  delete userOpts._raw;
  delete userOpts._json;

  user.update(
    { id: userOpts.id },
    { $set: userOpts },
    { upsert: true },

    function(err, newUser, stats){
      if(!err){
        if(stats.updatedExisting)
          console.log('Updated user', userOpts.name);
        else
          console.log('Created new user', userOpts.name);

        deferred.resolve(newUser);
      }
    }
  );

  return deferred.promise;
};


exports.findUser = function(opts){
  var deferred = Q.defer();

  user.findOne({
    emails: { $in: [{value: opts.email}] }
  }, function(err, foundUser){
    if(!err) deferred.resolve(foundUser);
  });

  return deferred.promise;
};
