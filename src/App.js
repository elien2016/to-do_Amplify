import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdMenu, MdDeleteOutline } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';

import { API, Storage } from 'aws-amplify';
import {
  withAuthenticator,
  Button,
  Heading,
  Flex,
  Image,
  Loader,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import './custom.css';
import { subscribePhoto } from './Utils';

import * as mutations from './graphql/mutations';

import { fetchSubscription } from './features/subscription/subscriptionSlice';
import { fetchTodoList } from './features/todoList/todoListSlice';

const initialState = { name: '', description: '' };

const App = ({ signOut, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState(initialState);
  const [selectedPhoto, setSelectedPhoto] = useState('');

  const todoSubscription = useSelector((state) => state.subscription);
  const todoList = useSelector((state) => state.todoList);

  const dispatch = useDispatch();

  console.log(todoSubscription);
  console.log(user);

  useEffect(() => {
    dispatch(fetchSubscription(user.attributes.email));
    dispatch(fetchTodoList());
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  function selectPhoto(event) {
    console.log('checkpoint');
    const file = event.target.files[0];

    if (!file) return;
    setSelectedPhoto(file);
  }

  async function addTodo() {
    try {
      if (!formState.name) {
        if (formState.description || selectedPhoto) {
          alert('Todo must have a title');
        }
        return;
      }

      const todo = { ...formState };
      setFormState(initialState);
      let fileName = '';

      if (selectedPhoto) {
        fileName = `${uuidv4()}_${selectedPhoto.name}`;
        await Storage.put('images/' + fileName, selectedPhoto, {
          contentType: selectedPhoto.type || 'image',
          level: 'private',
        });
        setSelectedPhoto(null);

        todo.image = await Storage.get('images/' + fileName, {
          level: 'private',
        });
      }

      dispatch({ type: 'todoList/todoAdded', payload: todo });
      API.graphql({
        query: mutations.createTodo,
        variables: { input: { ...formState, type: 'Todo', image: fileName } },
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <div className="container">
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Heading level={1} className={`heading ${menuOpen ? 'open' : ''}`}>
          Hello {user.username}
        </Heading>
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
      <Button onClick={signOut}>Sign out</Button>

      <h2>Todos</h2>
      <input
        onChange={(event) => setInput('name', event.target.value)}
        className="input"
        value={formState.name}
        placeholder="Title"
      />
      <input
        onChange={(event) => setInput('description', event.target.value)}
        className="input"
        value={formState.description}
        placeholder="Description"
      />

      {!todoSubscription ? (
        <button
          className="button"
          style={{
            marginBottom: '4px',
            padding: '12px 0px',
          }}
        >
          <Loader />
        </button>
      ) : todoSubscription.status === 'ACTIVE' ? (
        <>
          {selectedPhoto && (
            <Flex justifyContent="space-between" alignItems="center" gap="1rem">
              <p style={{ width: '300px', overflowWrap: 'break-word' }}>
                {selectedPhoto.name}
              </p>
              <div onClick={() => setSelectedPhoto(null)}>
                <MdDeleteOutline size="24px" />
              </div>
            </Flex>
          )}
          <button
            className="button"
            style={{
              marginBottom: '4px',
              padding: '0',
            }}
          >
            <label
              htmlFor="todo-img-upload"
              className="button"
              style={{
                padding: '12px 0px',
                display: 'block',
              }}
            >
              {(selectedPhoto ? 'Change' : 'Add') + ' Photo'}
            </label>
            <input
              type="file"
              id="todo-img-upload"
              name="todo-img-upload"
              accept="image/*"
              onChange={selectPhoto}
              style={{ display: 'None' }}
            />
          </button>
        </>
      ) : (
        <button
          className="button"
          style={{
            marginBottom: '4px',
            padding: '12px 0px',
          }}
          onClick={() => subscribePhoto(user.attributes.email)}
        >
          Subscribe to Add Photo
        </button>
      )}
      <button
        className="button"
        style={{ padding: '12px 0px' }}
        onClick={addTodo}
      >
        Create Todo
      </button>
      {todoList.map((todo, index) => (
        <div className="todo" key={todo.id || index}>
          <p className="todo-name">{todo.name}</p>
          <Flex justifyContent="space-between" alignItems="center" gap="1rem">
            <p
              className={`todo-description ${
                todo.image ? 'todo-description-with-image' : ''
              }`}
            >
              {todo.description}
            </p>
            {todo.image && (
              <Image
                src={todo.image}
                alt="Todo image"
                style={{ maxWidth: '160px' }}
              />
            )}
          </Flex>
        </div>
      ))}
    </div>
  );
};

export default withAuthenticator(App);
