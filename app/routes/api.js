var User = require('../models/user');
var config = require('../../config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

function createToken(user){
  var token = jsonwebtoken.sign({
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role
  }, secretKey, {
    expiresInMinute: 1440
  });

  return token;
};

module.exports = function(app, express){
  var api = express.Router();

  api.post('/signup', function(req, res){
    var user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role
    });

  user.save(function(err){
    if(err){
      res.send(err);
      return;
    }
      res.json({message: 'User created'});
    });
  });

  api.get('/users', function(req, res){
    User.find({}, function(err, users){
      if(err){
        res.send(err);
        return;
      }

      res.json(users);

    });
  });


  api.post('/login', function(req, res){
    User.findOne({
      username: req.body.username
    }).select('password').exec(function(err, user){
      
      if(err) throw err;

      if(!user){
        res.send({message: 'User doesnt exist'});
      } else if (user){
        var validPassword = user.comparePassword(req.body.password);

        if(!validPassword){
          res.send({message: 'Invalid password!'})
        } else {
           User.findOne({
            username: req.body.username
          }).exec(function(err, user){

          var token = createToken(user);

          res.json({
            success: true,
            message: "Successful login!",
            token: token
          });
        })
        }

      }

    });

  });

  api.use(function(req, res, next){
    console.log("Somebody just came to our app");

    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    console.log(token)
    if(token){
      jsonwebtoken.verify(token, secretKey, function(err, decoded){
        if(err){
          res.status(403).send({success: false, message: 'Authentication failed!'});
        }else{
          req.decoded = decoded;

          next();
        }
      });
    }else{
      res.status(403).send({success: false, message: "No token provided."});
    }
  });

  api.get('/me', function(req, res){
    res.json(req.decoded);
  })
  return api

}