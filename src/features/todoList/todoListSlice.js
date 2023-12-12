import { createSlice } from '@reduxjs/toolkit';

import { API, Storage } from 'aws-amplify';

import * as queries from '../../graphql/queries';

export const todoListSlice = createSlice({
  name: 'todoList',
  initialState: [],
  reducers: {
    todoListFetched(state, action) {
      return action.payload;
    },
    todoAdded(state, action) {
      return [...state, action.payload];
    },
  },
});

export const { todoListFetched } = todoListSlice.actions;

export const fetchTodoList = () => async (dispatch) => {
  try {
    const todoData = await API.graphql({ query: queries.listTodos });
    const todos = await Promise.all(
      todoData.data.listTodos.items.map(async (todo) => {
        if (todo.image) {
          todo.image = await Storage.get('images/' + todo.image, {
            level: 'private',
          });
        }
        return todo;
      })
    );

    console.log(todos);
    dispatch({ type: 'todoList/todoListFetched', payload: todos });
  } catch (err) {
    console.log('error fetching todos:', err);
  }
};

export default todoListSlice.reducer;
