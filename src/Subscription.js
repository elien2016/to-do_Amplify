import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBackIosNew, MdMenu } from 'react-icons/md';
import { loadStripe } from '@stripe/stripe-js';

import { API, graphqlOperation } from 'aws-amplify';
import {
  withAuthenticator,
  Flex,
  Heading,
  Text,
  SwitchField,
  Placeholder,
  Loader,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import './custom.css';
import { delay } from './Utils';

import { createTodoSubscription } from './graphql/mutations';
import { todoSubscriptionsByEmail } from './graphql/queries';

const Subscription = ({ user }) => {
  const [isChecked, setIsChecked] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [todoSubscription, setTodoSubscription] = useState(null);

  console.log(todoSubscription);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  async function fetchSubscriptions() {
    await delay(3000);

    try {
      const userEmail = user.attributes.email;
      const subscriptionsData = await API.graphql(
        graphqlOperation(todoSubscriptionsByEmail, {
          email: userEmail,
        })
      );
      const subscriptions =
        subscriptionsData.data.todoSubscriptionsByEmail.items;
      console.log(subscriptions);

      if (subscriptions.length === 0) {
        const createTodoSubscriptionData = await API.graphql(
          graphqlOperation(createTodoSubscription, {
            input: { email: userEmail, status: 'INACTIVE' },
          })
        );
        setTodoSubscription(
          createTodoSubscriptionData.data.createTodoSubscription
        );
      } else {
        setTodoSubscription(subscriptions[0]);
        setIsChecked(subscriptions[0].autoRenew === true);
      }
    } catch (err) {
      console.log('error fetching subscriptions:', err);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function subscribePhoto() {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUB_KEY);

    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        { price: process.env.REACT_APP_STRIPE_SUBSCRIPTION_ITEM, quantity: 1 },
      ],
      mode: 'subscription',
      successUrl: window.location.href,
      cancelUrl: window.location.href,
      customerEmail: user.attributes.email,
    });
    if (error) {
      console.log('error completing subscription:', error.message);
    }
  }

  async function toggleRenew(event) {
    setIsProcessing(true);
    setIsChecked(event.target.checked);

    const apiName = 'stripeapi';
    const path = '/update-subscription';
    const params = {
      body: {
        stripeId: todoSubscription.stripeId,
        autoRenew: event.target.checked,
      },
      headers: {
        Authorization: user.signInUserSession.idToken.jwtToken,
      },
    };

    try {
      const res = await API.post(apiName, path, params);
      console.log('autoRenew: ', res);

      if (res.error) {
        console.log(res.error);
        alert('Error');
      } else {
        setTodoSubscription({
          ...todoSubscription,
          autoRenew: event.target.checked,
        });
        alert('Success');
      }
    } catch (error) {
      console.log(error);
      alert('Error');
    }

    setIsProcessing(false);
  }

  return (
    <div className="container">
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Link to="/">
          <MdArrowBackIosNew size="26px" style={{ marginTop: '11px' }} />
        </Link>
        <div className="menu">
          <div onClick={toggleMenu} style={{ marginTop: '5px' }}>
            <MdMenu size="38px" />
          </div>
          <div className={`menu-items ${menuOpen ? 'open' : ''}`}>
            <Link
              to="/subscription"
              onClick={() => setMenuOpen(false)}
              className="button"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </Flex>

      <Flex
        direction="column"
        justifyContent="center"
        style={{ height: '50vh' }}
      >
        {!todoSubscription ? (
          <Placeholder />
        ) : todoSubscription.status === 'ACTIVE' ? (
          <>
            <Heading level={3}>Active</Heading>
            <Flex justifyContent="space-between">
              <div>
                <Heading level={4}>from</Heading>
                <Text fontSize="1.4em">{todoSubscription?.from}</Text>
              </div>
              <div>
                <Heading level={4}>to</Heading>
                <Text fontSize="1.4em">{todoSubscription?.to}</Text>
              </div>
            </Flex>
            <div>
              <Text
                fontWeight={700}
                style={{ display: 'inline', marginRight: '6px' }}
              >
                Auto-Renew
              </Text>
              {isProcessing ? (
                <Loader />
              ) : (
                <SwitchField
                  isChecked={isChecked}
                  isLabelHidden={true}
                  trackCheckedColor={'#00cc99'}
                  onChange={toggleRenew}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <Heading level={3}>Inactive</Heading>
            <button
              className="button"
              style={{
                marginBottom: '4px',
                padding: '12px 0px',
              }}
              onClick={subscribePhoto}
            >
              Subscribe
            </button>
          </>
        )}
      </Flex>
    </div>
  );
};

export default withAuthenticator(Subscription);
