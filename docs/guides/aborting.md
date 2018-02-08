# Aborting Requests

Browsers will soon support an API to allow developers to
[abort fetches](https://developers.google.com/web/updates/2017/09/abortable-fetch). Aborting
requests within React Request currently is not currently supported, but it is on the
project roadmap.

For more, refer to [this GitHub issue](https://github.com/jmeas/react-request/issues/26).

### Pseudo-aborts

The `<Fetch/>` component will "pseudo-abort" requests. With a faux-abort, the actual HTTP request
will not be aborted, but there are situations when the response will be ignored:

1. When the component unmounts
2. When a new request is initiated while an existing request is already in flight

In these situations, `onResponse` will be called with an error that has a `name` equal
to `AbortError`.

### Warning: don't use the `signal` prop

You may be tempted to use the `signal` prop of `<Fetch/>` to abort requests, but this
may not work as well as you would like it to. The `<Fetch/>` component will make a new
request anytime a new [request key](./request-keys.md) is generated from the props that
you pass in.

This means that you would need to create a new `AbortController` any time that there is
a new request key. Although this may work for limited use cases, it does not scale well,
so we do not recommend it as a general practice.
