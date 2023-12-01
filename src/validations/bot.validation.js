const Joi = require('joi');

const generateWorkSpace = {
  body: Joi.object().keys({
    context: Joi.string().required(),
    question: Joi.string().optional(),
    totalCreditsUsed: Joi.number().required(),
    totalResults: Joi.number().required(),
  }),
};

const getTranslateContent = {
  body: Joi.object().keys({
    workSpaceId: Joi.string().required(),
    article: Joi.string().required(),
    totalCreditsUsed: Joi.number().required(),
    language: Joi.string().required(),
  }),
};

const getSummarizeContent = {
  body: Joi.object().keys({
    workSpaceId: Joi.string().required(),
    article: Joi.string().required(),
    totalCreditsUsed: Joi.number().required(),
  }),
};

const saveAsFavourite = {
    body: Joi.object().keys({
      workSpaceId: Joi.string().required(),
      name: Joi.string().required(),
    }),
  };

module.exports = {
  generateWorkSpace,
  getTranslateContent,
  getSummarizeContent,
  saveAsFavourite,
};
