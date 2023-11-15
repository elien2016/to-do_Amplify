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
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import './custom.css';

import { createTodoSubscription, createTodo } from './graphql/mutations';
import { todoSubscriptionsByEmail, listTodos } from './graphql/queries';

const initialState = { name: '', description: '' };

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [todoSubscription, setTodoSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  async function fetchTodos() {
    // try {
    //   const todoData = await API.graphql(graphqlOperation(listTodos));
    //   const todos = await Promise.all(
    //     todoData.data.listTodos.items.map(async (todo) => {
    //       if (todo.image) {
    //         todo.image = await Storage.get('images/' + todo.image, {
    //           level: 'private',
    //         });
    //       }
    //       return todo;
    //     })
    //   );
    //   setTodos(todos);
    // } catch (err) {
    //   console.log('error fetching todos:', err);
    // }
  }

  useEffect(() => {
    fetchSubscriptions();
    fetchTodos();
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
        contentType: selectedPhoto.type ? selectedPhoto.type : 'image',
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
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={1} className={`heading ${menuOpen ? 'open' : ''}`}>
          Hello {user.username}
        </Heading>
        <div className="menu">
          <div onClick={toggleMenu}>
            <MdMenu size="32px" />
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
      <Button onClick={signOut}>Sign out</Button>
      <h2>Todos</h2>
      <input
        onChange={(event) => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Title"
      />
      <input
        onChange={(event) => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      {isSubscribed ? (
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
            style={{
              backgroundColor: 'black',
              outline: 'none',
              marginBottom: '4px',
              textAlign: 'center',
              padding: '0',
            }}
          >
            <label
              htmlFor="todo-img-upload"
              style={{
                color: 'white',
                fontSize: '18px',
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
          style={{
            ...styles.button,
            marginBottom: '4px',
            textAlign: 'center',
          }}
          onClick={subscribePhoto}
        >
          Subscribe to Add Photo
        </button>
      )}
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <Flex justifyContent="space-between" alignItems="center" gap="1rem">
            <p
              style={
                todo.image
                  ? {
                      ...styles.todoDescription,
                      maxWidth: '280px',
                      overflowWrap: 'break-word',
                    }
                  : styles.todoDescription
              }
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
    padding: '12px 0px',
  },
};

export default withAuthenticator(App);
