import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdArrowBackIosNew, MdMenu } from 'react-icons/md';
import { loadStripe } from '@stripe/stripe-js';

import { API, graphqlOperation, Storage } from 'aws-amplify';
import {
  withAuthenticator,
  Button,
  Heading,
  Flex,
  Image,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import './custom.css';

import { createTodoSubscription } from './graphql/mutations';
import { todoSubscriptionsByEmail } from './graphql/queries';

const Subscription = ({ signOut, user }) => {
  const [todoSubscription, setTodoSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  console.log(todoSubscription);
  console.log(window.history.state);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  async function fetchSubscriptions() {
    // let { state } = useLocation();
    // console.log(state, 'state!!!!!!!!!!!!');
    // if (state.subscription) {
    //   setTodoSubscription(state.subscription);
    //   setIsSubscribed(state.isSubscribed);
    //   return;
    // }

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
    fetchSubscriptions();
  }, []);

  async function subscribePhoto() {
    const stripe = await loadStripe(
      'pk_test_51O5HUgEgz1bDJ3oxz3RFiqn9rb1syosCDSa9fpst8m7KxxblDBZZeHszD0kM4LAGq6aOn5RncMqvnekY13REE7kz00EtJjgQGK'
    );
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

  return (
    <div style={styles.container}>
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
              style={styles.button}
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </Flex>

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
