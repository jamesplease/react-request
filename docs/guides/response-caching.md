# Response Caching

React Request has a built-in response caching system. Interactions with the
cache are configurable with the `fetchPolicy` and `cacheResponse` prop.

The way the cache works is like this: any time a response from the server is received,
it will be cached using the request's [request key](./request-keys.md). Subsequent
requests are matched with existing cached server responses using _their_ request key.

The `cacheResponse` prop determines if server responses will be cached. Typically,
you only want to cache responses for "read" requests. Accordingly, the default
value is based on the value of the `method` prop:

| Method                   | Default value |
| ------------------------ | ------------- |
| GET, HEAD, OPTIONS       | `true`        |
| POST, PUT, PATCH, DELETE | `false`       |

There are four ways that a `<Fetch/>` component can interact with the
cached responses, which are configurable with the `fetchPolicy` prop:

### `cache-first`

This is the default behavior.

Requests will first look at the cache to see if a response for the same key exists. If a response is
found, then it will be returned, and no network request will be made.

If no response exists in the cache, then a network request will be made.

### `cache-and-network`

Requests will first look at the cache. If a response exists in the cache,
then it will immediately be returned.

Whether or not a response exists in the cache, a network request will be made.

### `network-only`

The cache is ignored, and a network request is always made.

### `cache-only`

If a response exists in the cache, then it will be returned. If no response
exists in the cache, then an error will be passed into the render prop function.

---

Like `cacheResponse`, the default value of `fetchPolicy` is based on the method that you pass.

| Method                   | Default value    |
| ------------------------ | ---------------- |
| GET, HEAD, OPTIONS       | `"cache-first"`  |
| POST, PUT, PATCH, DELETE | `"network-only"` |

### Using `POST` for read requests

Some APIs use the `POST` method for read requests. React Request supports this, but you will
need to manually configure the cache. This may look something like this:

```jsx
<Fetch
  method="post"
  url="/books/2"
  cacheResponse
  fetchPolicy="cache-first"
  lazy={false}
/>
```

With the above configuration, responses will be stored in the cache, and requests will
only be made when the cache is empty. Also note that the [lazy prop](./using-the-lazy-prop.md)
is set to `false` so that the request fires when the component mounts.
