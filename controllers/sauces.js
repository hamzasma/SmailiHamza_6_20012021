const Sauces = require('../models/sauces');
const fs = require('fs');
const sauces = require('../models/sauces');
const { render } = require('../app');
//configuration des controllers//
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauces({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};
exports.getAllSauces = (req, res, next) => {
  Sauces.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};
exports.modifySauce = (req, res, next) => {

  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  console.log(req.body.imageUrl);
  if (req.body.imageUrl !== sauceObject.imageUrl) {
    Sauces.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !' }))
      .catch(error => res.status(400).json({ error }));
  }

};

exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauces.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
exports.likesauce = (req, res, next) => {

  sauces.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.body.like == 1) {
        sauce.likes++;
        sauce.usersLiked.push(req.body.userId);
      } else if (req.body.like == -1) {
        sauce.dislikes++;
        sauce.usersDisliked.push(req.body.userId);
      } else if (req.body.like == 0) {
        if (sauce.usersLiked.find(userId => userId == req.body.userId) != undefined) {
          sauce.likes--;
          sauce.usersLiked = sauce.usersLiked.filter(userId => userId != req.body.userId);
        } else if (sauce.usersDisliked.find(userId => userId == req.body.userId) != undefined) {
          sauce.dislikes--;
          sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId != req.body.userId);
        }
      }
      console.log(sauce);
     /* delete sauce._id;
      Sauces.updateOne({ _id: req.params.id }, { sauce })
        .then(() => res.status(200).json({ message: 'Objet modifié !' })).catch(error => res.status(400).json({ error }));*/
        sauce.save().then(() => res.status(200).json({ message: 'Objet modifié !' })).catch(error => res.status(400).json({ error }));
    }).catch(error => res.status(400).json({ error }));
}

