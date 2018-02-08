# Request Keys

React Request's two most useful features are
[request deduplication](./request-deduplication.md) and
[response caching](./response-caching.md).

Both of these features are powered by a system called "request keys," which are strings that
allow React Request to determine if two requests are to be considered identical.

### What is a Request Key

A request key is a string that is created from the props that you pass to `Fetch`.

The key is composed of these pieces of information:

* `url`
* `method`
* `body`

### How is it Used

**Request Deduplication**

When two or more `<Fetch/>` components with the same key attempt to fire off a request, only one HTTP
request will be sent off. When the response is returned, all of the components will
receive that single response.

For more, see the guide on [request deduplication](./request-deduplication.md).

**Response Caching**

Anytime a response is received for a request, it is stored in an internal cache. If
a subsequent request is attempted with the same key, then the cached version
will be returned instead.

For more, see the guide on [response caching](./response-caching.md).
