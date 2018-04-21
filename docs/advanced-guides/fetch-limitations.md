# `<Fetch/>` Limitations

The purpose of the [`<Fetch/>`](https://github.com/jamesplease/react-request#fetch-)
component is to simplify the code that you are writing for requests. In certain
situations, it may be more effort to use the `<Fetch/>` component than it is worth.

If you feel like you are writing messy code just for the sake of using the
`<Fetch/>` component, then it could be that `<Fetch/>` is not the right solution
for that situation.

One of the other exports of React Request is
[`fetchDedupe`](https://github.com/jamesplease/react-request#fetchdedupe-input--init--dedupeoptions-).
This is a wrapper around `global.fetch()` that provides you with several of the
benefits that you get from `<Fetch/>` in an imperative API.

To be an expert at React Request is to know when it makes sense to use `<Fetch/>`,
and when it makes sense to use `fetchDedupe()`.

### Throttling / Debouncing Requests

There is no good way to throttle or debounce the request that you configure
with `<Fetch/>`. If you need throttling or debouncing, we recommend that you implement it
imperatively using the `fetchDedupe` export.

> Heads up: we could add a prop to support this. If you think this is a better solution
> than implementing it imperatively, then you should let us know by
> [opening an issue](https://github.com/jamesplease/react-request/issues/new).

### Serial Requests

There is nothing preventing you from making serial requests in `<Fetch/>`. It is just that
there is no API that makes it straightforward to do. In simple situations, you may be
able to pull it off, but as a rule of thumb it can lead to messy, hard-to-debug code.

Remember: one of the purposes of `<Fetch/>` is to simplify the messy, hard-to-debug code
around response caching and request deduplication. If you replace that messy, hard-to-debug code
with _other_ messy, hard-to-debug code, then you are ending up where you began!

We are interested in making the serial request story better, but it is a work in progress.
Do you have ideas? Let us know in [this issue](https://github.com/jamesplease/react-request/issues/59).
