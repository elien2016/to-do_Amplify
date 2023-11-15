/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodoSubscription = /* GraphQL */ `
  mutation CreateTodoSubscription(
    $input: CreateTodoSubscriptionInput!
    $condition: ModelTodoSubscriptionConditionInput
  ) {
    createTodoSubscription(input: $input, condition: $condition) {
      id
      email
      status
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateTodoSubscription = /* GraphQL */ `
  mutation UpdateTodoSubscription(
    $input: UpdateTodoSubscriptionInput!
    $condition: ModelTodoSubscriptionConditionInput
  ) {
    updateTodoSubscription(input: $input, condition: $condition) {
      id
      email
      status
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteTodoSubscription = /* GraphQL */ `
  mutation DeleteTodoSubscription(
    $input: DeleteTodoSubscriptionInput!
    $condition: ModelTodoSubscriptionConditionInput
  ) {
    deleteTodoSubscription(input: $input, condition: $condition) {
      id
      email
      status
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const createTodo = /* GraphQL */ `
  mutation CreateTodo(
    $input: CreateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    createTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo(
    $input: UpdateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    updateTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo(
    $input: DeleteTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    deleteTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
