const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const validator = require('validator');

const tUserSchema = mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tUserSchema.plugin(toJSON);

/**
 * @typedef TUser
 */
const TUser = mongoose.model('TUser', tUserSchema);

module.exports = TUser;
