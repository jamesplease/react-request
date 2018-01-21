# Differences with Apollo

React Apollo is a great library, and it serves as the primary inspiration for React Request.
There are a few places where this library is different from React Apollo.

### Missing Features

React Request is still a work in progress. The following features haven't
been implemented yet:

* Polling
* Optimistic responses
* `errorPolicy` prop
* `notifyOnNetworkStatusChange` prop

These features will be added shortly. If you're interested in helping out, we love Pull Requests!

### Higher-order Component vs Render Props

This library uses a render prop rather than a higher-order component (HoC). Render props are more
powerful than HoCs, which is why we went with this approach.

Once the new React context API is finalized, we will likely adjust this project's API to more closely
align with that API.

### No queries or mutations

With GraphQL, whether a request is a query or a mutation determines whether the request is made
when the component mounts. React Request looks at the HTTP method instead to determine if the
request is likely a read request or a write request. This determines the value of the `lazy`
prop, which is what determines whether the request is made on mount or not.

### No Data Normalization

React Apollo normalizes your data, and makes it available through the store. This requires a
definition of a "resource" or "entity," which is beyond the scope of this library.

You can build a library on top of React Request that implements a system like that.
