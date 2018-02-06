# Integration with Other Technologies

React Request can be a foundation for building integrations with other technologies. This
guide can provide guidance if you're looking to use React Request with other tools.

### GraphQL

We recommend either simply using Apollo instead of React Request, or looking at the Apollo
documentation for inspiration.

The reason is that React Request only caches and dedupes at the request level, whereas
a library like apollo caches and dedupes at the sub-request level. The structure of
GraphQL enables for a more granular approach to those features.

### Redux

Data returned by your server can be synchronized with your Redux store if you'd like. An
idea for how to do this would be:

1. Define a consistent format for the server response
2. If necessary, use the `transformData` prop to ensure that all of your responses
   adhere to the format
3. Use the `beforeFetch` and `afterFetch` callbacks to dispatch the necessary Redux actions
   to get server data into the store

### Redux Resource

This library was built with [Redux Resource](https://redux-resource.js.org) in mind.
Official bindings are in the works.
