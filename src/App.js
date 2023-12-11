import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdMenu, MdDeleteOutline } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { loadStripe } from '@stripe/stripe-js';

import { API, graphqlOperation, Storage } from 'aws-amplify';
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
import { delay } from './Utils';

import { createTodoSubscription, createTodo } from './graphql/mutations';
import { todoSubscriptionsByEmail, listTodos } from './graphql/queries';

const initialState = { name: '', description: '' };

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [todoSubscription, setTodoSubscription] = useState(null);

  console.log(todoSubscription);
  console.log(user);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  async function fetchSubscriptions() {
    await delay(3500);

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
      }
    } catch (err) {
      console.log('error fetching subscriptions:', err);
    }
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
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

      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos:', err);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
    // fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
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
      const fileName = `${uuidv4()}_${selectedPhoto.name}`;
      await Storage.put(fileName, selectedPhoto, {
        contentType: selectedPhoto.type || 'image',
        level: 'private',
      });
      setSelectedPhoto('');

      todo.image = await Storage.get(fileName);
      setTodos([...todos, todo]);
      API.graphql(
        graphqlOperation(createTodo, {
          input: { ...formState, image: fileName },
        })
      );
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  function selectPhoto(event) {
    const file = event.target.files[0];

    if (!file) return;
    setSelectedPhoto(file);
  }

  function removeSelectedPhoto() {
    setSelectedPhoto('');
  }

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

  return (
    <div className="container">
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Heading level={1} className={`heading ${menuOpen ? 'open' : ''}`}>
          Hello {user.username}
        </Heading>
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
              <div onClick={removeSelectedPhoto}>
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
          onClick={subscribePhoto}
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
      {todos.map((todo, index) => (
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
