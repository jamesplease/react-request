# Using the `lazy` Prop

One of the props of the `<Fetch/>` component is `lazy`. This
determines whether or not a request will be made when the
component mounts.

The default value of `lazy` depends on the request method
being used.

| Method                   | Default value |
| ------------------------ | ------------- |
| GET, HEAD, OPTIONS       | `false`       |
| POST, PUT, PATCH, DELETE | `true`        |

This is due to the way applications typically use these methods
when performing reads and writes.

### Read Requests

Read requests are frequently done as a result of the user navigating
to some section of the page. For instance, if your application is for
a library, and the user visits the URL `/books/2`, then you will likely
want to kick off a request to fetch that book right after the page loads.

This is why `lazy` is `false` for `GET` requests.

> Sometimes, APIs will use `POST` for read requests. In these situations, you will
need to manually specify `lazy` as `false` if you would like to make the request
when the component mounts.

### Write Requests

Typically, write requests, such as updating or deleting a resource, are not done
as the result of a user simply navigating to a page. Instead, these are typically
performed when a user clicks a button to confirm the action.

This is why `lazy` is `true` for HTTP methods that typically refer to write requests.

### Dynamic `lazy` prop usage

A neat pattern is to specify a dynamic `lazy` value based on some application state. For
instance, consider a search page that serializes the user's search into a query parameter.

When the app loads, you may want to make the request immediately when the query parameter
exists. But if there isn't a query parameter, then you won't want to make the request, because
there's no search term to use in the request.

You can use a dynamic value for `lazy` to implement this behavior. The example below
demonstrates how you might go about doing this.

```jsx
<Fetch {...fetchProps} lazy={Boolean(params.search)}>
  {children}
</Fetch>
```
