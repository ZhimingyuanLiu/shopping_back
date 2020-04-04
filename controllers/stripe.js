const User = require('../models/user');
const stripe = require('stripe')('sk_test_KVw39oqcg2ABshtS2kPxTR8900DndZ1iGX');
const uuid = require('node-uuid');

require('dotenv').config();
exports.generateToken = async (req, res) => {
  console.log('testing');
  console.log('Request:', req.body);

  let error;
  let status;
  try {
    const { price, token } = req.body;
    console.log(req.body);
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const idempotency_key = uuid.v1();
    const charge = await stripe.charges.create(
      {
        amount: price * 100,
        currency: 'usd',
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased those product`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        idempotency_key,
      }
    );
    console.log('Charge:', { charge });
    status = 'success';
  } catch (error) {
    console.error('Error:', error);
    status = 'failure';
  }

  res.json({ error, status });
};
