# Changelog

### v3.1.2 (2018/8/2)

**Bug Fixes**

- Fixes a bug that can occur in React Native environments

### v3.1.1 (2018/7/10)

**Bug Fixes**

- A race condition has been fixed.

### v3.1.0 (2018/7/10)

**New Features**

- `doFetch` now returns a Promise that _always_ resolves. The value that it resolves to is
  the same object that is passed to `afterFetch`. Note that `afterFetch` is only called when a
  network request has actually been performed, whereas `doFetch` resolves even when the cache is hit.

### v3.0.1 (2018/4/24)

**Bug Fixes**

- Fixes a bug where `isLazy` would sometimes be computed using previous
  props rather than the current props.

### v3.0.0 (2018/4/24)

> Although the changes in this release are technically breaking, they are unlikely to
> affect most users' code.

**Breaking Changes**

- When a request fails, the `data` from a request will no longer be set to `null`. This
  allows you to control whether or not your UI continues to display the existing data.

- The `responseType` prop is now more forgiving. If the body cannot be parsed with
  the `responseType` that you set, then `data` will be set to `null`.

### v2.0.4 (2018/4/20)

**Bug Fixes**

- Fixes a bug where there could be a cache mismatch when re-rendering the same component
  that has a fetch policy configured.

### v2.0.3 (2018/3/2)

**Bug Fixes**

- Fixes a bug where the `lazy` prop was not always respected. Anytime that a new request key was generated,
  a request would be made.

### v2.0.2 (2018/2/21)

**Bug Fixes**

- Fixes a bug where an Uncaught ReferenceError could be thrown

### v2.0.1 (2018/2/17)

**Bug Fixes**

- This fixes a problem where the default `fetchPolicy` would be `"cache-first"` for "write" requests.

### v2.0.0 (2018/2/17)

**Breaking**

- `transformResponse` has been renamed to be `transformData`
- `fetchPolicy` is now determined by the method that you pass in. This change was made to support using
  POST methods for read requests, and is unlikely to break your code.
- A new prop, `cacheResponse`, is used to determine if a response is added to the cache or
  not. This is to support using POST methods for read requests, and is unlikely to break your code.

**New Features**

- A new `failed` property is passed to you in the render prop callback. This allows you to
  quickly determine if a request failed for any reason (be it network errors or "error" status
  codes).

### v1.1.0 (2018/2/7)

**New Features**

- `responseType` can now be specified as a function. It receives the `response`
  as the first argument.
- Adds a `requestKey` prop.
- When the request is "faux-aborted," the error will have a `name` equal to `AbortError`.
  This matches the name of the native error, allowing you to write future-proof code that
  handles aborted requests.

### v1.0.0 (2018/2/4)

**Breaking**

- The `responseType` will now be set to `"text"` anytime a response returns
  with a 204 status code.
- The `responseType` is no longer used when creating the request key.

### v0.3.0 (2018/2/4)

**Changes**

- `fetch-dedupe` has been abstracted into a separate library. This
  does not change the public API of this library.

### v0.2.0 (2018/2/1)

**New Features**

- The render prop will now be passed the `requestKey`.

### v0.1.0 (2018/2/1)

React's new Context API has been finalized, and it uses functional `children` rather than a prop
named `render`. Accordingly, this library has been updated to use `children` as the default.

**Breaking**

- `<Fetch/>` now uses `children` as the render prop, rather than `render`.
