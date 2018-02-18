# Changelog

### v2.0.1 (2018/2/17)

**Bug Fixes**

* This fixes a problem where the default `fetchPolicy` would be `"cache-first"` for "write" requests.

### v2.0.0 (2018/2/17)

**Breaking**

* `transformResponse` has been renamed to be `transformData`
* `fetchPolicy` is now determined by the method that you pass in. This change was made to support using
  POST methods for read requests, and is unlikely to break your code.
* A new prop, `cacheResponse`, is used to determine if a response is added to the cache or
  not. This is to support using POST methods for read requests, and is unlikely to break your code.

**New Features**

* A new `failed` property is passed to you in the render prop callback. This allows you to
  quickly determine if a request failed for any reason (be it network errors or "error" status
  codes).

### v1.1.0 (2018/2/7)

**New Features**

* `responseType` can now be specified as a function. It receives the `response`
  as the first argument.
* Adds a `requestKey` prop.
* When the request is "faux-aborted," the error will have a `name` equal to `AbortError`.
  This matches the name of the native error, allowing you to write future-proof code that
  handles aborted requests.

### v1.0.0 (2018/2/4)

**Breaking**

* The `responseType` will now be set to `"text"` anytime a response returns
  with a 204 status code.
* The `responseType` is no longer used when creating the request key.

### v0.3.0 (2018/2/4)

**Changes**

* `fetch-dedupe` has been abstracted into a separate library. This
  does not change the public API of this library.

### v0.2.0 (2018/2/1)

**New Features**

* The render prop will now be passed the `requestKey`.

### v0.1.0 (2018/2/1)

React's new Context API has been finalized, and it uses functional `children` rather than a prop
named `render`. Accordingly, this library has been updated to use `children` as the default.

**Breaking**

* `<Fetch/>` now uses `children` as the render prop, rather than `render`.
