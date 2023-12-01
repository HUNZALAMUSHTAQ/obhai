const httpStatus = require('http-status');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const catchAsync = require('../utils/catchAsync');
const { stripeService, userService } = require('../services');
var jwt = require('jsonwebtoken');
const { createOrUpdateTUserByEmail } = require('../services/user.service');
const { sendEmail, sendEmailAccessToken } = require('../services/email.service');

const createCheckoutSession = catchAsync(async (req, res) => {
  const session = await stripeService.createCheckOutSession(req.body);
  res.status(httpStatus.CREATED).send({ url: session.url });
});

const validateToken = catchAsync(async (req, res) => {
  if (!req.headers.authorization || !req.headers.authorization.split(' ')[1]) {
    console.log('header not exists ');
    return res.status(httpStatus.UNAUTHORIZED).send();
  }
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
    console.log(decoded)
    // The token is valid, you can access the decoded information
    res.json({ authorized: true, ...decoded  });
  });
});


const cancelSubscription = catchAsync(async (req, res) => {
  if (req.user.stripeSubscription) {
    await stripeService.cancelSubscription(req.user.stripeSubscription.id);
    await userService.updateUserById(req.user.id, {
      stripeSubscription: null,
      paymentType: null,
      paymentPlan: null,
    });
  }
  res.status(httpStatus.NO_CONTENT).send();
});
const stripeWebHook = catchAsync(async (req, res) => {
  console.log('WEEBHHOOOKK');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  /* eslint-disable no-case-declarations */
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      const userBelogs = {
        email: session.customer_details.email,
        sessionId: session.id,
        customer: session.customer,
        name: session.customer_details.name,
        createdAt: session.created,
      };
      console.log(userBelogs);
      const accessToken = jwt.sign(userBelogs, process.env.JWT_SECRET);
      userBelogs.accessToken = accessToken;
      console.log(accessToken, 'Access Token');
      const user = await createOrUpdateTUserByEmail(userBelogs.email, userBelogs);
      console.log(user);
      await sendEmailAccessToken(user, accessToken)

      break;
    case 'invoice.paid':

      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      // const portalSession = await stripe.billingPortal.sessions.create({
      //   customer: '{{CUSTOMER_ID}}',
      //   return_url: 'https://example.com/account/overview',
      //   flow_data: {
      //     type: 'payment_method_update',
      //   },
      // });
      break;
    default:
    // Unhandled event type
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).end();
});

module.exports = {
  createCheckoutSession,
  cancelSubscription,
  stripeWebHook,
  validateToken,
};
