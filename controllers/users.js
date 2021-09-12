const User = require('../models/user');

const getUsers = (req, res, next) => {
  User.find({})
  .then((users) => {
    res.status(200).send({ data: users } );
  })
  .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
  .then((user) => {
    res.status(200).send(user)
  })
  .catch(next)
};

const createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
  .then((user) => {
    res.status(200).send(user);
  })
  .catch(next)
};

module.exports = { getUsers, getUserById, createUser };