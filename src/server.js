const express = require("express");
var path = require("path");
const { secretKeyStripe } = require("./stripe");
const { prettyPrint } = require("./common");
const interceptHttpAsCurl = require("./interceptHttpAsCurl");
var bodyParser = require("body-parser");

const port = 3000;
const app = express();

app.use(bodyParser.json());

interceptHttpAsCurl();

// This could be done using webhooks
const waitForChargableSource = async (sourceId) => {
  const source = await secretKeyStripe.sources.retrieve(sourceId);
  if (source.status !== "chargeable") {
    return await waitForChargableSource(sourceId);
  }
  return source;
};

app.post("/api/create-payment-intent/", async (request, response) => {
  const paymentMethodId = request.body.paymentMethodId;

  const customer = await secretKeyStripe.customers.create({
    payment_method: paymentMethodId,
  });
  console.log("\n\nCustomer: ");
  prettyPrint(customer);

  const setupIntent = await secretKeyStripe.setupIntents.create({
    customer: customer.id,
    payment_method: paymentMethodId,
    payment_method_types: ["card"],
    usage: "off_session",
    return_url: "http://localhost:3000/completed.html",
    confirm: true,
  });
  console.log("\n\nSetupIntent: ");
  prettyPrint(setupIntent);
  response.send({
    client_secret: setupIntent.client_secret,
    next_action: setupIntent.next_action,
  });
});

app.use(express.static(path.join(__dirname, "website")));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
