/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTodoSubscription = /* GraphQL */ `
  query GetTodoSubscription($id: ID!) {
    getTodoSubscription(id: $id) {
      id
      email
      status
      stripeId
      from
      to
      autoRenew
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listTodoSubscriptions = /* GraphQL */ `
  query ListTodoSubscriptions(
    $filter: ModelTodoSubscriptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodoSubscriptions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        email
        status
        stripeId
        from
        to
        autoRenew
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const todoSubscriptionsByEmail = /* GraphQL */ `
  query TodoSubscriptionsByEmail(
    $email: AWSEmail!
    $sortDirection: ModelSortDirection
    $filter: ModelTodoSubscriptionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    todoSubscriptionsByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        email
        status
        stripeId
        from
        to
        autoRenew
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
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
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        image
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
