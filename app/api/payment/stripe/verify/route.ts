import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmation } from '@/lib/notifications';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { getStripe, fromStripeAmount } from '@/lib/stripe';

/**
 * POST /api/payment/stripe/verify
 *
 * Fallback verifier for the `/order-success` page. The webhook is the
 * authoritative source of truth, but in the (rare) case that the user
 * returns from Stripe before the webhook lands we ping Stripe directly to
 * confirm the payment was captured and mark the order paid.
 *
 * Body: { orderNumber: string }
 */
export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req);
    const rl = checkRateLimit(`stripe-verify:${clientId}`, RATE_LIMITS.payment);
    if (!rl.success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const { orderNumber } = (await req.json().catch(() => ({}))) as { orderNumber?: string };
    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid orderNumber' },
        { status: 400 },
      );
    }
    if (!/^ORD-\d+-\d+$/.test(orderNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order number format' },
        { status: 400 },
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, payment_status, status, total, currency, email, metadata')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        status: order.status,
        payment_status: order.payment_status,
        message: 'Order already paid',
      });
    }

    const intentId: string | undefined = order.metadata?.stripe_payment_intent_id;
    if (!intentId) {
      return NextResponse.json({
        success: false,
        status: order.status,
        payment_status: order.payment_status,
        message: 'No Stripe PaymentIntent associated with this order yet',
      });
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        status: order.status,
        payment_status: order.payment_status,
        message: `Payment not yet captured (Stripe status: ${intent.status})`,
      });
    }

    const paidAmount = fromStripeAmount(intent.amount_received || intent.amount, intent.currency);
    if (Math.abs(paidAmount - Number(order.total)) > 0.01) {
      console.error(
        `[Stripe Verify] AMOUNT MISMATCH on ${orderNumber}: expected ${order.total}, got ${paidAmount}`,
      );
      return NextResponse.json({ success: false, message: 'Payment amount mismatch' }, { status: 400 });
    }

    const { data: orderJson, error: rpcError } = await supabaseAdmin.rpc('mark_order_paid', {
      order_ref: orderNumber,
      moolre_ref: intent.id,
    });

    if (rpcError) {
      console.error('[Stripe Verify] RPC error:', rpcError.message);
      return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
    }

    if (orderJson?.email) {
      try {
        await supabaseAdmin.rpc('update_customer_stats', {
          p_customer_email: orderJson.email,
          p_order_total: orderJson.total,
        });
      } catch {
        /* swallow */
      }
    }

    try {
      if (orderJson) await sendOrderConfirmation(orderJson);
    } catch (e: any) {
      console.error('[Stripe Verify] notification failed:', e?.message);
    }

    return NextResponse.json({
      success: true,
      status: 'processing',
      payment_status: 'paid',
      message: 'Payment verified and order updated',
    });
  } catch (err: any) {
    console.error('[Stripe Verify] error:', err?.message ?? err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
