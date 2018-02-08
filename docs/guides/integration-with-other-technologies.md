# Integration with Other Technologies

React Request was designed to integrate well with other tools in the ecosystem.

### GraphQL

At the moment, a system like Apollo or Relay is better suited for GraphQL.

The reason for this is that React Request only caches and dedupes at the _request level_,
whereas a library like Apollo caches and dedupes at the sub-request level.

This is important because GraphQL allows you to embed multiple operations into a single
HTTP request.

> Note: multiple operation request support is on the roadmap for this project.

### Redux

Data returned by your server can be synchronized with your Redux store. The
`beforeFetch` and `afterFetch` methods make this straightforward to do.

The following example demonstrates how you might go about doing this:

```jsx
<Fetch
  {...fetchProps}
  beforeFetch={data => {
    store.dispatch({
      type: 'FETCH_PENDING'
      // ...add whatever you want here
    });
  }}
  afterFetch={data => {
    if (data.error || (data.response && !data.response.ok)) {
      store.dispatch({
        type: 'FETCH_FAILED'
        // ...add other things to this action
      });
    } else {
      store.dispatch({
        type: 'FETCH_SUCCEEDED'
        // ...add other things to this action
      });
    }
  }}
/>
```

### Redux Resource

React Request was built with [Redux Resource](https://redux-resource.js.org) in mind.
An official library that provides React bindings for Redux Resource is in the works, and it
will use React Request.
