const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
var CryptoJS = require("crypto-js");
const emailMask2Options = {
  maskWith: "*",
  unmaskedStartCharactersBeforeAt: 3,
  unmaskedEndCharactersAfterAt: 2,
  maskAtTheRate: false
};

//configuration des controllers//
exports.signup = (req, res, next) => {
  var encryptedmail = CryptoJS.AES.encrypt(req.body.email, "8Zz5tw0Ionm3XP");
  var decr = CryptoJS.AES.decrypt(encryptedmail, '8Zz5tw0Ionm3XP');
  console.log(decr.toString());
  bcrypt.hash(req.body.password, 10)
    .then(hash => {

      const user = new User({
        email: decr.toString(),
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  var encryptedmail = CryptoJS.AES.encrypt(req.body.email, "8Zz5tw0Ionm3XP");
  var decr = CryptoJS.AES.decrypt(encryptedmail, '8Zz5tw0Ionm3XP');
  console.log(decr.toString());
  User.findOne({ email: decr.toString() })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            //Creation des tokens d'authentification//
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};