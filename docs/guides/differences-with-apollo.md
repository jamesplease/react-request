# Differences with Apollo

React Apollo is a great library, and it served as the primary inspiration for React Request.
There are a few places where this library is different from React Apollo.

### Missing Features

React Request is intended to be relatively lightweight, so it does not implement these
features or props from React Apollo:

* Polling
* Optimistic responses
* `errorPolicy` prop
* `notifyOnNetworkStatusChange` prop

The reason for these omissions is that we believe that you can implement this features in your
application, or in a wrapping component, without too much extra work. If you disagree, open an issue –
we may very well be wrong!

### Higher-order Component vs Render Props

This library uses a render prop rather than a higher-order component (HoC). As of January 2018,
React Apollo does not implement render prop components, although they are on that project's roadmap
for a future release.

Render prop components are more powerful than HoCs, so we currently do not intend to release
an HoC. But you can build your own if you really want one!

### No queries or mutations

With GraphQL, whether a request is a query or a mutation determines whether the request is made
when the component mounts. React Request looks at the HTTP method instead to determine if the
request is likely a read request or a write request. This determines the value of the `lazy`
prop, which is what determines whether the request is made on mount or not.

### No Data Normalization

React Apollo normalizes your data, and makes it available through the store. This requires a
definition of a "resource" or "entity," which is beyond the scope of this library.

If you want data normalization, you need two things:

1. a location to place the normalized data in memory (typically called a store)
2. a library or framework that defines what a resource or entity is

For instance, [Redux](https://redux.js.org) can fulfill the role of item 1 while
[Redux Resource](https://redux-resource.js.org) can fulfill the role of item 2.

Once you have those two things, you can use React Request to provide declarative
requests (in fact, the official React bindings for Redux Resource will be built
using React Request).
