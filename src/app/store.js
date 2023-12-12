import { configureStore } from '@reduxjs/toolkit';

import todoListReducer from '../features/todoList/todoListSlice';
import subscriptionReducer from '../features/subscription/subscriptionSlice';

export default configureStore({
  reducer: {
    todoList: todoListReducer,
    subscription: subscriptionReducer,
  },
});
