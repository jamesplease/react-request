# Request Deduplication

React Request will prevent two identical HTTP requests from being in flight at the
same time. It does this by comparing the [request key](./request-keys.md) of any
new request with the keys of all in-flight requests.

When an existing request is already in flight for that same key, then a new
request will not be dispatched. Instead, the same response will be sent to
both requestors.

### Examples

In the following example, only one HTTP request is made:

```jsx
class App extends Component {
  render() {
    return (
      <div>
        <Fetch url="/posts/1" />
        <Fetch url="/posts/1" />
      </div>
    );
  }
}
```

However, in this example, two requests are made because the URLs are different, resulting in
a different request key:

```jsx
class App extends Component {
  render() {
    return (
      <div>
        <Fetch url="/posts/1" />
        <Fetch url="/posts/2" />
      </div>
    );
  }
}
```

### Reliability

Fr APIs that communicate through JSON, this system assume that `JSON.stringify`
produces the same string given two objects that would be considered "deeply equal."

This may seem unreliable to you, but Apollo
[has been doing it this way for some time](https://github.com/apollographql/apollo-link/blob/d5b0d4c491563ed36c50170e0b4c6c5f8c988d59/packages/apollo-link/src/linkUtils.ts#L121-L127),
and that is a library with half a million downloads per month (as of February 2018). So it seems to
be a reliable system.

Needless to say, if this behavior ever causes problems, then we will revisit the approach.

### Disabling deduplication

You can disable deduplication with the `dedupe` prop.

```jsx
// In this example, two identical HTTP requests will be made at the same time.
class App extends Component {
  render() {
    return (
      <div>
        <Fetch url="/posts/1" dedupe={false} />
        <Fetch url="/posts/1" dedupe={false} />
      </div>
    );
  }
}
```
