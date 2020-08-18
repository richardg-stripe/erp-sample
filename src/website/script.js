const REDIRECT_URL = `${window.location.origin}/completed.html`;
const PUBLIC_KEY =
  "pk_test_51HHQHWKUloXd1vNV24Foml7WueHfzYLADVa80RCcmKnOZ2d57R1JK7CyCkDHb3Ey8r52HN0T159BEQ1MkvmOQjxx00SZM1zGn3";
const stripe = window.Stripe(PUBLIC_KEY);

const elements = stripe.elements();

const card = elements.create("card");

card.mount("#card-element");

const handlePaymentIntentResponse = async (response) => {
  console.log("handlePIR", response);
  if (response.error) {
    displayError(response.error.message);
  } else if (!response.next_action) {
    window.location.href = "/completed.html";
  } else if (response.next_action.type === "redirect_to_url") {
    window.location.href = response.next_action.redirect_to_url.url;
  } else if (response.next_action.type === "use_stripe_sdk") {
    // See https://stripe.com/docs/payments/payment-intents/migration-synchronous
    const confirmResponse = await stripe.confirmCardSetup(
      response.client_secret
    );
    if (confirmResponse.error) {
      displayError(JSON.stringify(confirmResponse.error));
    } else {
      window.location.href = "/completed.html";
    }
    console.log("confirmResponse", confirmResponse);
  }
};

const makePayment = async (paymentMethodId) => {
  const response = await createPaymentIntent(paymentMethodId);
  console.log(response);
  await handlePaymentIntentResponse(response);
};

const createPaymentIntent = async (paymentMethodId) => {
  const result = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentMethodId: paymentMethodId }),
  });
  const response = await result.json();
  console.log(response);
  if (!result.ok) {
    return {
      error: response,
    };
  }

  return {
    ...response,
    error: null,
  };
};

const displayError = (error) => {
  document.querySelector("p#error").textContent = error;
};

document
  .querySelector("button#pay-card-button")
  .addEventListener("click", async () => {
    const paymentMethod = await stripe.createPaymentMethod({
      type: "card",
      card: card,
    });
    console.log(paymentMethod);
    if (paymentMethod.error) {
      displayError(paymentMethod.error.message);
      return;
    }
    await makePayment(paymentMethod.paymentMethod.id);
  });
