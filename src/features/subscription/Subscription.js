import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdArrowBackIosNew, MdMenu } from 'react-icons/md';

import { API } from 'aws-amplify';
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

import '../../custom.css';
import { subscribePhoto } from '../../Utils';

import { fetchSubscription } from './subscriptionSlice';

const Subscription = ({ user }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const todoSubscription = useSelector((state) => state.subscription);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubscription(user.attributes.email));
  }, []);

  async function toggleRenew(event) {
    setIsProcessing(true);

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

      if (res.error) {
        console.log(res.error);
        alert('Error');
      } else {
        dispatch({
          type: 'subscription/autoRenewUpdated',
          payload: event.target.checked,
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
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ marginTop: '5px' }}
          >
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
                  isChecked={todoSubscription?.autoRenew}
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
              onClick={() => subscribePhoto(user.attributes.email)}
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
