import { createSlice } from '@reduxjs/toolkit';

import { API, graphqlOperation } from 'aws-amplify';

import { delay } from '../../Utils';

import { createTodoSubscription } from '../../graphql/mutations';
import { todoSubscriptionsByEmail } from '../../graphql/queries';

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: null,
  reducers: {
    subscriptionFetched(state, action) {
      return action.payload;
    },
    autoRenewUpdated(state, action) {
      return { ...state, autoRenew: action.payload };
    },
  },
});

export const { subscriptionFetched, autoRenewUpdated } =
  subscriptionSlice.actions;

export const fetchSubscription = (email) => async (dispatch) => {
  await delay(3000);

  try {
    const subscriptionsData = await API.graphql(
      graphqlOperation(todoSubscriptionsByEmail, {
        email,
      })
    );
    const subscriptions = subscriptionsData.data.todoSubscriptionsByEmail.items;
    console.log(subscriptions);

    if (subscriptions.length === 0) {
      const createTodoSubscriptionData = await API.graphql(
        graphqlOperation(createTodoSubscription, {
          input: { email, status: 'INACTIVE' },
        })
      );
      dispatch({
        type: 'subscription/subscriptionFetched',
        payload: createTodoSubscriptionData.data.createTodoSubscription,
      });
    } else {
      dispatch({
        type: 'subscription/subscriptionFetched',
        payload: subscriptions[0],
      });
    }
  } catch (err) {
    console.log('error fetching subscriptions:', err);
  }
};

export default subscriptionSlice.reducer;
