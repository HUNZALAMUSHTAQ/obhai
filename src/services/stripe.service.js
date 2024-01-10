const httpStatus = require('http-status');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const ApiError = require('../utils/ApiError');

const paymentPlans = {
  monthly: {
    plan1: {
      price: process.env.STRIPE_PLAN_1,
      quantity: 1,
    },
    plan2: {
      price: process.env.STRIPE_PLAN_2,
      quantity: 1,
    },
    plan3: {
      price: process.env.STRIPE_PLAN_3,
      quantity: 1,
    },
  },
};

const getPaymentMode = "subscription"
// const getPlanTokens = {
//   plan400: 500,
// };

// const getPaymentMode = {
//   plan400: 'subscription',
// };
/**
 * Create a Customer
 * @param {Object} customerDetails
 * @returns {Promise<Customer>}
 */

const createCustomer = async (customerDetails) => {
  const customer = await stripe.customers.create({
    name: customerDetails.name,
    email: customerDetails.email,
    description: customerDetails.description,
  });

  return customer;
};

/**
 * Create a Checkout Session
 * @param {Object} userBody
 * @returns {Promise<string>}
 */
const createCheckOutSession = async (userBody, user) => {
  let selectedPlan = {};
  if (paymentPlans.monthly[userBody.paymentPlan]) {
    selectedPlan = paymentPlans.monthly[userBody.paymentPlan];
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment plan not found');
  }
  console.log(paymentPlans)
  const sessionObj = {
    billing_address_collection: 'auto',
    line_items: [{ ...selectedPlan }],
    metadata: {
      paymentPlan: userBody.paymentPlan,
    },
    mode: "subscription",
    success_url: `${process.env.FRONTEND_BASE_URL}/pages/payment/success?paymentPlan=${userBody.paymentPlan}`,
    cancel_url: `${process.env.FRONTEND_BASE_URL}/pages/payment/fail?paymentPlan=${userBody.paymentPlan}`,
  };
    sessionObj.subscription_data = {
      metadata: sessionObj.metadata,
  }
  const session = await stripe.checkout.sessions.create(sessionObj);
  return session;
};

const getCheckOutSession = async (sessionId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
};

const getSubscription = async (subscriptionId) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
};

const cancelSubscription = async (subscriptionId) => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
};

module.exports = {
  createCheckOutSession,
  createCustomer,
  getCheckOutSession,
  getSubscription,
  cancelSubscription,
};
