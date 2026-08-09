const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  basico: { amount: 2990, name: 'Painel do Numerólogo — Básico' },  // R$ 29,90/mês
  pro:    { amount: 5990, name: 'Painel do Numerólogo — Pro' },      // R$ 59,90/mês
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const body = req.body || {};
    const planKey = PLANS[body.plano] ? body.plano : 'basico';
    const plan = PLANS[planKey];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: 'Acesso ao gerador de mapas numerológicos completos para numerólogos profissionais.',
            },
            unit_amount: plan.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?paid_pro=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      metadata: {
        projeto: 'app-numerologia',
        plano: planKey,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
