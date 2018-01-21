# Integration with Other Technologies

React Request can be a foundation for building integrations with other technologies. This
guide can provide guidance if you're looking to use React Request with other tools.

### GraphQL

We recommend either simply using Apollo instead of React Request, or looking at the Apollo
documentation for inspiration.

### Redux

Data returned by your server can be synchronized with your Redux store if you'd like. An
idea for how to do this would be:

1. Define a consistent format for the server response
2. If necessary, use the `transformData` prop to ensure that all of your responses
   adhere to the format
3. Use the `onResponse` callback to dispatch the necessary Redux actions to get
   server data into the store

### Redux Resource

This library was built with [Redux Resource](https://redux-resource.js.org) in mind.
Official bindings are in the works.
