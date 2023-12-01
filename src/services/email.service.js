const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const logger = require('../config/logger');
const config = require('../config/config');
const { User } = require('../models');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const user = await User.findOne({ email: to });

  const __dirname = path.resolve();
  const filePath = path.join(`${__dirname}/src/email-templates/reset-password.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);

  const resetPasswordUrl = `${process.env.FRONTEND_BASE_URL}/pages/authentication/reset-password?token=${token}`;
  const subject = 'Reset password';

  const replacements = {
    name: `${user.firstName} ${user.lastName}`,
    email: to,
    redirectLink: resetPasswordUrl,
  };
  const htmlToSend = template(replacements);
  const text = resetPasswordUrl;

  await sendEmail(to, subject, text, htmlToSend);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const user = await User.findOne({ email: to });
  const __dirname = path.resolve();
  const filePath = path.join(`${__dirname}/src/email-templates/verify.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);

  const subject = 'Email Verification';

  const verificationEmailUrl = `${process.env.FRONTEND_BASE_URL}/pages/authentication/verify-email?token=${token}`;
  const text = verificationEmailUrl;
  const replacements = {
    name: `${user.firstName} ${user.lastName}`,
    email: to,
    redirectLink: verificationEmailUrl,
  };
  const htmlToSend = template(replacements);

  await sendEmail(to, subject, text, htmlToSend);
};


const sendEmailAccessToken = async (user, token) =>{
  const __dirname = path.resolve();
  const filePath = path.join(`${__dirname}/src/email-templates/email-access.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);

  const to = user.email;
  const subject = 'Your Access Token';

  const text = 'Your Access Token'
  const replacements = {
    name: user.name,
    email: to,
    token: token
  };
  const htmlToSend = template(replacements);

  await sendEmail(to, subject, text, htmlToSend);
}



module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailAccessToken
};
