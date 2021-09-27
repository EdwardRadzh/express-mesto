const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const linkRegExp = require('../constants/linkRegExp');

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);

usersRouter.get('/users/me', getCurrentUser);

usersRouter.get('/users/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  getUserById);

usersRouter.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(20),
    }),
  }),
  updateUser);

usersRouter.patch('/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().pattern(linkRegExp),
    }),
  }),
  updateAvatar);

module.exports = usersRouter;
