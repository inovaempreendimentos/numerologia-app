const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const subscriptionId = req.query.subscription_id;
  if (!subscriptionId) {
    res.status(400).json({ error: 'subscription_id is required' });
    return;
  }
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const active = sub.status === 'active' || sub.status === 'trialing';
    res.status(200).json({ active: active, status: sub.status });
  } catch (err) {
    res.status(200).json({ active: false, status: 'unknown' });
  }
};
