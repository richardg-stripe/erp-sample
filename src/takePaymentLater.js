const { secretKeyStripe } = require("./stripe");
const { prettyPrint } = require("./common");
const interceptHttpAsCurl = require("./interceptHttpAsCurl");
interceptHttpAsCurl();

(async () => {
  const setupIntentId = process.env.STRIPE_SETUP_INTENT_ID;

  // Check setup intent was completed by customer!
  const setupIntent = await secretKeyStripe.setupIntents.retrieve(
    setupIntentId
  );

  if (setupIntent.status !== "succeeded") {
    throw Error("Customer didn't complete authorization");
  }

  const customerId = setupIntent.customer;
  const paymentMethods = await secretKeyStripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  prettyPrint(paymentMethods);
  const paymentMethodId = paymentMethods.data[0].id;
  const paymentIntent1 = await secretKeyStripe.paymentIntents.create({
    amount: 10000,
    currency: "SEK",
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });

  console.log("Payment Intent 1:");
  prettyPrint(paymentIntent1);
  // later again
  const paymentIntent2 = await secretKeyStripe.paymentIntents.create({
    amount: 12000,
    currency: "SEK",
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });

  console.log("Payment Intent 2:");
  prettyPrint(paymentIntent2);

  // Delete customer when you're done
  await secretKeyStripe.customers.del(customerId);
})();
