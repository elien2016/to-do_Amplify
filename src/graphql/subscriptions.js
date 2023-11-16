/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTodoSubscription = /* GraphQL */ `
  subscription OnCreateTodoSubscription(
    $filter: ModelSubscriptionTodoSubscriptionFilterInput
    $owner: String
  ) {
    onCreateTodoSubscription(filter: $filter, owner: $owner) {
      id
      email
      status
      stripeId
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateTodoSubscription = /* GraphQL */ `
  subscription OnUpdateTodoSubscription(
    $filter: ModelSubscriptionTodoSubscriptionFilterInput
    $owner: String
  ) {
    onUpdateTodoSubscription(filter: $filter, owner: $owner) {
      id
      email
      status
      stripeId
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteTodoSubscription = /* GraphQL */ `
  subscription OnDeleteTodoSubscription(
    $filter: ModelSubscriptionTodoSubscriptionFilterInput
    $owner: String
  ) {
    onDeleteTodoSubscription(filter: $filter, owner: $owner) {
      id
      email
      status
      stripeId
      from
      to
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateTodo = /* GraphQL */ `
  subscription OnCreateTodo(
    $filter: ModelSubscriptionTodoFilterInput
    $owner: String
  ) {
    onCreateTodo(filter: $filter, owner: $owner) {
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
export const onUpdateTodo = /* GraphQL */ `
  subscription OnUpdateTodo(
    $filter: ModelSubscriptionTodoFilterInput
    $owner: String
  ) {
    onUpdateTodo(filter: $filter, owner: $owner) {
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
export const onDeleteTodo = /* GraphQL */ `
  subscription OnDeleteTodo(
    $filter: ModelSubscriptionTodoFilterInput
    $owner: String
  ) {
    onDeleteTodo(filter: $filter, owner: $owner) {
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
