# Using the `lazy` Prop

One of the props to the `<Fetch/>` component is `lazy`. This
determines whether or not a request will be made when the
component mounts.

The default value of `lazy` depends on the request method
being used.

| Method                   | Default value |
| ------------------------ | ------------- |
| GET, HEAD, OPTIONS       | `false`       |
| POST, PUT, PATCH, DELETE | `true`        |

This is due to the differences between how applications typically
make read and write requests.

### Read Requests

Read requests are frequently done as a result of the user navigating
to some section of the page. For instance, if your application is for
a library, and the user visits the URL `/books/2`, then you will likely
want to kick off a request to fetch that book right after the page loads.

This is why `lazy` is `false` for `GET` requests.

### Write Requests

Typically, write requests, such as updating or deleting a resource, are not done
as the result of navigation. Instead, these are typically performed when a
user clicks a button to confirm their action.

This is why `lazy` is `true` for HTTP methods that typically refer to write requests.

### Exceptions

Sometimes, APIs will use `POST` for read requests. In these situations, you will
need to manually specify `lazy` as `false` if you would like to make the request
when the component mounts.
