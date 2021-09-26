const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const AuthError = require('../errors/AuthError');
const NotFound = require('../errors/NotFound');
const DefaultError = require('../errors/DefaultError');

const { NODE_ENV, JWT_SECRET } = process.env;

const login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new AuthError('Неверный логин или пароль');
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        });
      return res.status(200).send({ token });
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send({ data: users });
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Нет пользователя с таким id');
      }
      res.status(200).send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  return User.findOne({ email })
    .then((mail) => {
      if (mail) {
        throw new Conflict('Такой пользователь уже существует');
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          throw new DefaultError('Ошибка на сервере');
        }
        User.create({
          name, about, avatar, email, password: hash,
        })
          .then((user) => {
            res.status(200).send({
              data: {
                name: user.name, about: user.about, avatar: user.avatar, email: user.email,
              },
            });
          });
      });
    })

    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        next(new Conflict('Пользователь с таким email уже существует'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequest(err.message));
      } else {
        next(err);
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    {
      new: true,
      runValidators: true,
    })
    .then((newUser) => {
      if (!newUser) {
        throw new NotFound('id пользователя не найден!');
      }
      res.status(200).send(newUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(err.message));
      } else {
        next(err);
      }
    });
};

const updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id,
    {
      avatar: req.body.avatar,
    },
    {
      new: true,
      runValidators: true,
    })
    .then((avatar) => {
      if (!avatar) {
        throw new NotFound('id пользователя не найден!');
      }
      res.status(200).send(avatar);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(err.message));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports = {
  login,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  getCurrentUser,
};
