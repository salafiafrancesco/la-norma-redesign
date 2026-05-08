/**
 * Stripe helpers — scaffold for future payment integration.
 *
 * To activate:
 * 1. npm install stripe @stripe/stripe-js
 * 2. Set STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET in .env
 * 3. Uncomment the implementation below and remove the stubs
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const IS_TEST_MODE = process.env.STRIPE_TEST_MODE === 'true';

// TODO: Uncomment when stripe is installed
// import Stripe from 'stripe';
// const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

/**
 * Check whether Stripe is configured and ready to use.
 */
export function isStripeEnabled() {
  return Boolean(STRIPE_SECRET_KEY);
}

/**
 * Create a Stripe Checkout Session for an experience booking.
 *
 * @param {object} params
 * @param {string} params.eventTitle
 * @param {string} params.eventDate
 * @param {number} params.priceCents       unit price in cents
 * @param {number} params.guests
 * @param {string} params.customerEmail
 * @param {string} params.bookingId        internal booking ID
 * @param {string} params.successUrl       redirect on success
 * @param {string} params.cancelUrl        redirect on cancel
 * @returns {Promise<{ sessionId: string, url: string }>}
 */
export async function createCheckoutSession({
  eventTitle,
  eventDate,
  priceCents,
  guests,
  customerEmail,
  bookingId,
  successUrl,
  cancelUrl,
}) {
  if (!isStripeEnabled()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.');
  }

  // TODO: Replace with actual Stripe call
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'payment',
  //   customer_email: customerEmail,
  //   client_reference_id: String(bookingId),
  //   line_items: [{
  //     price_data: {
  //       currency: 'usd',
  //       product_data: {
  //         name: eventTitle,
  //         description: `${guests} guest${guests > 1 ? 's' : ''} · ${eventDate}`,
  //       },
  //       unit_amount: priceCents,
  //     },
  //     quantity: guests,
  //   }],
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  //   metadata: {
  //     booking_id: String(bookingId),
  //     guests: String(guests),
  //   },
  // });
  //
  // return { sessionId: session.id, url: session.url };

  throw new Error('Stripe checkout is not yet implemented. Use paymentMode=request for now.');
}

/**
 * Verify and parse a Stripe webhook event.
 *
 * @param {Buffer} rawBody
 * @param {string} signature    Stripe-Signature header
 * @returns {object}            Stripe event object
 */
export function constructWebhookEvent(rawBody, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  // TODO: Replace with actual Stripe call
  // return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);

  throw new Error('Stripe webhooks are not yet implemented.');
}

export default {
  isStripeEnabled,
  createCheckoutSession,
  constructWebhookEvent,
  IS_TEST_MODE,
};
