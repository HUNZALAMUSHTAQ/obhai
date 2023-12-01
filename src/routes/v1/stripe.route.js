const express = require('express');
const validate = require('../../middlewares/validate');
const stripeValidation = require('../../validations/stripe.validation');
const stripeController = require('../../controllers/stripe.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/create-checkout-session', validate(stripeValidation.checkoutSession), stripeController.createCheckoutSession);

router.post('/validate-token', stripeController.validateToken);

router.post('/cancel-subscription', auth(), stripeController.cancelSubscription);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebHook);

module.exports = router;
