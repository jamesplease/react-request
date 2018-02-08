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

Data returned by your server can be synchronized with your Redux store if you'd like. The
`beforeFetch` and `afterFetch` methods make this straightforward.

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

This library was built with [Redux Resource](https://redux-resource.js.org) in mind.
Official bindings are in the works.
