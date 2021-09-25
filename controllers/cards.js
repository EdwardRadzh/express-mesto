const Card = require('../models/card');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');
const BadRequest = require('../errors/BadRequest');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length === 0) {
        throw new NotFound('Нет карточек');
      }
      res.status(200).send(cards);
    })
    .catch((err) => {
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest(err.message);
      }
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Нет карточки с таким Id');
      }
      if (String(card.owner) !== String(req.user._id)) {
        throw new Forbidden('Недостаточно прав');
      }
      res.status(200).send(card);
    })
    .catch(next);
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((like) => {
      if (!like) {
        throw new NotFound('Нет пользователя с таким Id');
      }
      res.status(200).send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest(err.message);
      } else {
        res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((like) => {
      if (!like) {
        throw new NotFound('Нет пользователя с таким Id');
      }
      res.status(200).send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest(err.message);
      } else {
        res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
