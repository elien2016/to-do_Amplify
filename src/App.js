import React, { useEffect, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';

import { API, graphqlOperation, Storage } from 'aws-amplify';
import {
  withAuthenticator,
  Button,
  Heading,
  Flex,
  Image,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

const initialState = { name: '', description: '' };

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = await Promise.all(
        todoData.data.listTodos.items.map(async (todo) => {
          if (todo.image) {
            todo.image = await Storage.get(todo.image);
          }
          return todo;
        })
      );
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos:', err);
    }
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
      const fileName = `images/${uuidv4()}_${selectedPhoto.name}`;
      await Storage.put(fileName, selectedPhoto, {
        contentType: selectedPhoto.type ? selectedPhoto.type : 'image',
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

  const selectPhoto = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    setSelectedPhoto(file);
  };

  const removeSelectedPhoto = () => {
    setSelectedPhoto('');
  };

  return (
    <div style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
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
      <label
        htmlFor="todo-img-upload"
        style={{ ...styles.button, marginBottom: '4px', textAlign: 'center' }}
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
