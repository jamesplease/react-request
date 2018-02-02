# Differences with `fetch()`

Whenever possible, we try to follow standard usage of the
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
API. There are a few differences between using `fetch()` and this
library, which are explained here.

### `init` is not an Object

The second argument to `fetch()` is an optional object called `init`. With
`<Fetch/>`, the object has been spread out as props. This change was made
for aesthetic reasons: I find it ugly to pass objects as props.

```js
fetch('/posts/2', {
  method: 'PATCH',
  credentials: 'include',
  body: JSON.stringify({ title: 'New post' })
});
```

```jsx
<Fetch
  url="/posts/2"
  method="PATCH"
  credentials="include"
  body={JSON.stringify({ title: 'New post' })}
/>
```

### The response body is read for you

When using `fetch`, you must manually read the body. This
library reads it automatically for you. This is because the body
is a ReadableStream, and can only be read a single time. It was
a requirement that we read it for you to support
[deduplication of requests](./request-deduplication.md).

```js
fetch('/posts/2', {
  method: 'PATCH',
  credentials: 'include',
  body: JSON.stringify({ title: 'New post' })
})
  .then(res => res.body.json())
  .then(data => {
    console.log('Got my JSON', data);
  });
```

```jsx
<Fetch
  url="/posts/2"
  method="PATCH"
  credentials="include"
  body={JSON.stringify({ title: 'New post' })}
  render={({ data }) => {
    console.log('Got my JSON', data);
    return null;
  }}
/>
```

### Only string request bodies are supported

For now, you may only pass strings as the request body. This is
due to the fact that we need to build a request key for
[request deduplication](./request-deduplication.md) and
response caching.

In the future, we plan to add support for additional request body types.

### Aborting requests

When aborting `fetch()`, you will typically do the following:

1. Create an AbortController object
2. Pass the AbortSignal object into `fetch`

This system does not work with `<Fetch/>`, because it would be tedious
for you to create a new AbortController anytime the component was going
to make a new request.

We plan to add support for aborting, but for now it is not supported. For
more, see the guide on [aborting requests](./aborting.md).
