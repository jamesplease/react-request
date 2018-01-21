# Aborting Requests

Browsers will soon support an API to allow developers to
[abort fetches](https://developers.google.com/web/updates/2017/09/abortable-fetch).

Aborting requests within React Request currently isn't currently supported, but it will
be added soon.

For more, refer to [this GitHub issue](https://github.com/jmeas/react-request/issues/26).

### Don't use the `signal` prop

You may be tempted to use the `signal` prop of `<Fetch/>` to abort requests, but this
may not work as well as you would like it to. The `<Fetch/>` component will make a new
request anytime a new [request key](./request-keys.md) is generated from the props that
you pass in.

This means that you would need to create a new `AbortController` any time that there is
a new request key.

Although this may work for some use cases, it does not scale well, so we do not recommend
it as a general practice.
