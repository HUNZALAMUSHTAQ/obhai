const Joi = require('joi');

const checkoutSession = {
  body: Joi.object().keys({
    paymentPlan: Joi.string().required(),
  }),
};

module.exports = {
  checkoutSession,
};
