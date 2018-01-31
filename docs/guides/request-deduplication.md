# Request Deduplication

Sometimes, two separate areas of your application will need the same data. There
are two ways to get this data to those areas:

1. Make a single request in a common ancestor, and pass the data down
2. Make two requests in the two areas of the application

Both of these solutions have problems. The problem with the first approach is that it isn't
always straightforward to pass data down a deeply-nested component tree.

The problem with the second approach is that if both components mount at the same time, then
two identical requests will be fired off. This isn't efficient.

With React Request, we encourage you to use the second system. We have a
solution in place that solves the problem described above that is called
**request deduplication**.

### How does it work

Request deduplication is possible due to request keys. Refer to
[the guide on request keys](./request-keys.md) for more.

### Examples

In the following example, only one HTTP request is made:

```jsx
class App extends Component {
  render() {
    return (
      <div>
        <Request url="/posts/1" />
        <Request url="/posts/1" />
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
        <Request url="/posts/1" />
        <Request url="/posts/2" />
      </div>
    );
  }
}
```

### This seems unreliable

Fr APIs that communicate through JSON, this system assume that `JSON.stringify`
produces the same string given two objects that would be considered "deeply equal."

This may seem unreliable to you, but Apollo
[has been doing it this way for some time](https://github.com/apollographql/apollo-link/blob/d5b0d4c491563ed36c50170e0b4c6c5f8c988d59/packages/apollo-link/src/linkUtils.ts#L121-L127),
and it seems to be working.

If this behavior ever causes problems, then we will revisit the approach.

### Disabling deduplication

You can disable deduplication with the `dedupe` prop.

```jsx
// In this example, two identical HTTP requests will be made at the same time.
class App extends Component {
  render() {
    return (
      <div>
        <Request url="/posts/1" dedupe={false} />
        <Request url="/posts/1" dedupe={false} />
      </div>
    );
  }
}
```
