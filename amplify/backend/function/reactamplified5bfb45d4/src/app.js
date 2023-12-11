/* Amplify Params - DO NOT EDIT
	ENV
	FUNCTION_REACTAMPLIFIEDGETTODOSUBSCRIPTIONBYEMAIL_NAME
	FUNCTION_REACTAMPLIFIEDUPDATETODOSUBSCRIPTION_NAME
	REGION
Amplify Params - DO NOT EDIT */
/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["stripe_key","endpoint_secret"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const aws = require('aws-sdk');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const AWS_REGION = process.env.REGION || 'us-west-1';

// declare a new express app
const app = express();
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json({
      verify: function (res, req, buf) {
        req.rawBody = buf.toString();
      },
    })(req, res, next);
  }
});
app.use(awsServerlessExpressMiddleware.eventContext());
// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const getStripeKey = async () => {
  const { Parameters } = await new aws.SSM()
    .getParameters({
      Names: ['stripe_key'].map((secretName) => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();
  return Parameters[0].Value;
};

const getEndpointSecret = async () => {
  const { Parameters } = await new aws.SSM()
    .getParameters({
      Names: ['endpoint_secret'].map((secretName) => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();
  return Parameters[0].Value;
};

app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async function (req, res) {
    console.log('req: ', req);
    const stripeKey = await getStripeKey();
    const stripe = require('stripe')(stripeKey);

    const sig = req.headers['stripe-signature'];
    const endpointSecret = await getEndpointSecret();
    try {
      evnt = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }

    req.body = JSON.parse(req.body);
    const customer = await stripe.customers.retrieve(
      req.body.data.object.customer
    );
    const userEmail = customer.email;

    const client = new LambdaClient({ region: AWS_REGION });
    const input = {
      FunctionName:
        process.env.FUNCTION_REACTAMPLIFIEDGETTODOSUBSCRIPTIONBYEMAIL_NAME,
      Payload: JSON.stringify({ email: userEmail }),
    };
    const command = new InvokeCommand(input);
    const response = await client.send(command);
    const responseObject = JSON.parse(Buffer.from(response.Payload).toString());
    if (!responseObject.body) {
      console.log(responseObject);
      res.status(400).end();
      return;
    }
    responseObject.body = JSON.parse(responseObject.body);
    const subscription = responseObject.body[0];
    console.log('subscription: ', subscription);

    // Update todoSubscription if necessary
    if (
      (req.body.data.object.status === 'active' &&
        subscription.status === 'INACTIVE') ||
      (req.body.data.object.status !== 'active' &&
        subscription.status === 'ACTIVE') ||
      req.body.data.object.cancel_at_period_end === subscription.autoRenew
    ) {
      let input;
      if (
        req.body.data.object.status === 'active' &&
        subscription.status === 'INACTIVE'
      ) {
        startDate = new Date(req.body.data.object.current_period_start * 1000);
        endDate = new Date(req.body.data.object.current_period_end * 1000);
        startDateString = [
          '' + startDate.getFullYear(),
          ('0' + (startDate.getMonth() + 1)).slice(-2),
          ('0' + startDate.getDate()).slice(-2),
        ].join('-');
        endDateString = [
          '' + endDate.getFullYear(),
          ('0' + (endDate.getMonth() + 1)).slice(-2),
          ('0' + endDate.getDate()).slice(-2),
        ].join('-');
        input = {
          FunctionName:
            process.env.FUNCTION_REACTAMPLIFIEDUPDATETODOSUBSCRIPTION_NAME,
          Payload: JSON.stringify({
            id: subscription.id,
            email: subscription.email,
            status: 'ACTIVE',
            stripeId: req.body.data.object.id,
            from: startDateString,
            to: endDateString,
            autoRenew: !req.body.data.object.cancel_at_period_end,
          }),
        };
      } else if (
        req.body.data.object.status !== 'active' &&
        subscription.status === 'ACTIVE'
      ) {
        input = {
          FunctionName:
            process.env.FUNCTION_REACTAMPLIFIEDUPDATETODOSUBSCRIPTION_NAME,
          Payload: JSON.stringify({
            id: subscription.id,
            email: subscription.email,
            status: 'INACTIVE',
            stripeId: req.body.data.object.id,
            from: null,
            to: null,
            autoRenew: null,
          }),
        };
      } else {
        input = {
          FunctionName:
            process.env.FUNCTION_REACTAMPLIFIEDUPDATETODOSUBSCRIPTION_NAME,
          Payload: JSON.stringify({
            id: subscription.id,
            email: subscription.email,
            status: 'ACTIVE',
            stripeId: req.body.data.object.id,
            from: subscription.from,
            to: subscription.to,
            autoRenew: !req.body.data.object.cancel_at_period_end,
          }),
        };
      }

      const command = new InvokeCommand(input);
      const response = await client.send(command);
      const responseObject = JSON.parse(
        Buffer.from(response.Payload).toString()
      );
      console.log(responseObject);
    }

    res.status(200).end();
  }
);

app.post('/update-subscription', async (req, res) => {
  console.log(req);
  const userEmail = req.apiGateway.event.requestContext.authorizer.claims.email;
  console.log(userEmail);

  const client = new LambdaClient({ region: AWS_REGION });
  const input = {
    FunctionName:
      process.env.FUNCTION_REACTAMPLIFIEDGETTODOSUBSCRIPTIONBYEMAIL_NAME,
    Payload: JSON.stringify({ email: userEmail }),
  };
  const command = new InvokeCommand(input);
  const response = await client.send(command);
  const responseObject = JSON.parse(Buffer.from(response.Payload).toString());
  if (!responseObject.body) {
    console.log(responseObject);
    res.status(400).end();
    return;
  }
  responseObject.body = JSON.parse(responseObject.body);
  const subscription = responseObject.body[0];
  console.log('subscription: ', subscription);
  if (subscription.stripeId !== req.body.stripeId) {
    res.status(403).end();
    return;
  }

  const stripeKey = await getStripeKey();
  const stripe = require('stripe')(stripeKey);

  let updatedSubscription;
  if (req.body.autoRenew) {
    updatedSubscription = await stripe.subscriptions.update(req.body.stripeId, {
      cancel_at_period_end: false,
    });
  } else {
    updatedSubscription = await stripe.subscriptions.update(req.body.stripeId, {
      cancel_at_period_end: true,
    });
  }
  console.log(updatedSubscription);

  res.send(updatedSubscription);
});

app.listen(3000, function () {
  console.log('App started');
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
