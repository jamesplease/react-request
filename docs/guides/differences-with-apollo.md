# Differences with Apollo

React Apollo is a great library, and it served as the primary inspiration for React Request.
There are a few places where this library is different from React Apollo.

### Missing Features

React Request is intended to be relatively lightweight, so it does not implement these
props from React Apollo:

* Polling
* Optimistic responses
* `errorPolicy` prop
* `notifyOnNetworkStatusChange` prop

The general idea behind these omissions is that we believe that implementing these features
within your app shouldn't be much work. If you disagree, open an issue – we may be
wrong!

### Higher-order Component vs Render Props

This library uses a render prop rather than a higher-order component (HoC). As of January 2018,
React Apollo does not implement render prop components, although they are on the roadmap for
a future release.

Render prop components are more powerful than HoCs, so we currently do not intend to release
an HoC. But you can build your own!

### No queries or mutations

With GraphQL, whether a request is a query or a mutation determines whether the request is made
when the component mounts. React Request looks at the HTTP method instead to determine if the
request is likely a read request or a write request. This determines the value of the `lazy`
prop, which is what determines whether the request is made on mount or not.

### No Data Normalization

React Apollo normalizes your data, and makes it available through the store. This requires a
definition of a "resource" or "entity," which is beyond the scope of this library.

You can build a library on top of React Request that implements a system like that.
