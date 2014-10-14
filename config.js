module.exports = function(){
  var config = process.env;
  try{
    var vars = require('./env-vars.js')();
    for(var prop in vars){
      config[prop] = vars[prop];
    }
  } catch(e){}

  return config;
};
