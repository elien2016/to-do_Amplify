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
      return [action.payload, ...state];
    },
  },
});

export const { todoListFetched } = todoListSlice.actions;

export const fetchTodoList = () => async (dispatch) => {
  try {
    const todoData = await API.graphql({
      query: queries.todosByDate,
      variables: { type: 'Todo', sortDirection: 'DESC' },
    });
    const todos = await Promise.all(
      todoData.data.todosByDate.items.map(async (todo) => {
        if (todo.image) {
          todo.image = await Storage.get('images/' + todo.image, {
            level: 'private',
          });
        }
        return todo;
      })
    );

    dispatch({ type: 'todoList/todoListFetched', payload: todos });
  } catch (err) {
    console.log('error fetching todos:', err);
  }
};

export default todoListSlice.reducer;
