# Request Keys

Two useful features of React Request are
[request deduplication](./request-deduplication.md) and response caching.

These features are powered by a system called "request keys" that allows us to
determine if two requests are identical.

### What is a request key

A request key is a string that is created from the props that you pass to `Fetch`.

The key is composed of these pieces of information:

* `url`
* `method`
* `contentType`
* `body`

### How is it used

**Request Deduplication**

When multiple `<Fetch/>` components attempt to make requests with the same key, only one HTTP
request will be sent off. When the response is returned, all of the components will
receive the response.

For more, see the guide on [request deduplication](./request-deduplication.md).

**Response Caching**

Anytime a response is received for a request, it is stored in an internal cache. If
a subsequent request needs to be made that has the same key, then the cached version
will be returned instead.

This behavior can be customized with the `fetchPolicy` prop.
