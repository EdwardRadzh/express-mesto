const usersRouter = require('express').Router();
const { getUsers, getUserById, createUser } = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/:userid', getUserById);
usersRouter.post('/users', createUser);

module.exports = usersRouter;