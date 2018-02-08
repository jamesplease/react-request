# Response Caching

React Request has a built-in response caching system. Interactions with the
cache are configurable with the `fetchPolicy` prop.

The way the cache works is like this: any time a response from the server is received,
it will be cached using the request's [request key](./request-keys.md). Subsequent
requests are matched with existing cached server responses using _their_ request key.

There are four ways that a `<Fetch/>` component can interact with the
cache.

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
