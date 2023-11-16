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
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import './custom.css';

import { createTodoSubscription } from './graphql/mutations';
import { todoSubscriptionsByEmail } from './graphql/queries';

const Subscription = ({ signOut, user }) => {
  const [todoSubscription, setTodoSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChecked, setIsChecked] = React.useState(true);
  const [stripe, setStripe] = React.useState(null);
  console.log(todoSubscription);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  async function fetchSubscriptions() {
    try {
      const subscriptionsData = await API.graphql(
        graphqlOperation(todoSubscriptionsByEmail, {
          email: user.attributes.email,
        })
      );
      const subscriptions =
        subscriptionsData.data.todoSubscriptionsByEmail.items;
      if (subscriptions.length === 0) {
        const createTodoSubscriptionData = await API.graphql(
          graphqlOperation(createTodoSubscription, {
            input: { email: user.attributes.email, status: 'INACTIVE' },
          })
        );
        setTodoSubscription(
          createTodoSubscriptionData.data.createTodoSubscription
        );
      } else {
        setTodoSubscription(subscriptions[0]);
        setIsSubscribed(subscriptions[0].status === 'ACTIVE');
      }
    } catch (err) {
      console.log('error fetching subscriptions:', err);
    }
  }

  useEffect(() => {
    const state = window.history.state;

    // Test
    console.log(state);

    if (state.usr?.subscription) {
      setTodoSubscription(state.usr.subscription);
      setIsSubscribed(state.usr.subscription.status == 'ACTIVE');
    } else {
      fetchSubscriptions();
    }
  }, []);

  async function subscribePhoto() {
    if (!stripe) {
      setStripe(
        await loadStripe(
          'pk_test_51O5HUgEgz1bDJ3oxz3RFiqn9rb1syosCDSa9fpst8m7KxxblDBZZeHszD0kM4LAGq6aOn5RncMqvnekY13REE7kz00EtJjgQGK'
        )
      );
    }
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_1O9f9tEgz1bDJ3oxqzbWtG7g', quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.protocol + '//' + window.location.host,
      cancelUrl: window.location.protocol + '//' + window.location.host,
      customerEmail: user.attributes.email,
    });
    if (error) {
      console.log('error completing subscription:', error.message);
    }
  }

  async function toggleRenew(event) {
    setIsChecked(event.target.checked);

    if (!stripe) {
      setStripe(
        await loadStripe(
          'pk_test_51O5HUgEgz1bDJ3oxz3RFiqn9rb1syosCDSa9fpst8m7KxxblDBZZeHszD0kM4LAGq6aOn5RncMqvnekY13REE7kz00EtJjgQGK'
        )
      );
    }
    if (event.target.checked) {
      const subscription = await stripe.subscriptions.update(
        todoSubscription.id,
        {
          cancel_at_period_end: false,
        }
      );
    } else {
      const subscription = await stripe.subscriptions.update(
        todoSubscription.id,
        {
          cancel_at_period_end: true,
        }
      );
    }
  }

  return (
    <div style={styles.container}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Link to="/" state={{ subscription: todoSubscription }}>
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
              style={styles.button}
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
        {isSubscribed ? (
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
              <SwitchField
                isChecked={isChecked}
                isLabelHidden={true}
                trackCheckedColor={'#00cc99'}
                onChange={toggleRenew}
              />
            </div>
          </>
        ) : (
          <>
            <Heading level={3}>Inactive</Heading>
            <button
              style={{
                ...styles.button,
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

const styles = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: 'none',
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: 'black',
    color: 'white',
    outline: 'none',
    fontSize: 18,
  },
};

export default withAuthenticator(Subscription);
