# Best Practices

Here are some tips for using React Request.

### Handling errors

Handling errors isn't as simple as looking at the `error` object
that is passed to you in render. The `error` object is only included as an
argument in the following situations:

1. A network error occurred, such as a timeout or a loss of network connection
2. A new request "aborted" the previous one (meaning that the component
   will ignore the response of the earlier request)

Clearly, there are other situations where you might consider the component
to be in an error state, such as when a 404 is returned.

The best way to identify those is by looking at the `response.ok` key.
This is a Boolean that is `false` anytime that the `status` of the response
is `>= 400`. So this will catch other errors such as Not Found errors, Unauthorized errors,
and other client and server errors.

Together, checking for `error` and `response.ok` should cover all possible
situations when a request is "unsuccessful." An example demonstrating this
approach of handling of errors looks like:

```js
<Fetch {...fetchProps}>
  {({ error, response }) => {
    if (error || (response && !response.ok)) {
      console.log('There was some kind of error.');
    } else {
      console.log('The request is either loading or it succeeded');
    }
  }}
</Fetch>
```

Of course, by looking at the `error` object or the `response` object in greater detail,
you can provide your user with a more granular message, explaining to them what has
gone wrong.

### Making "fetch components"

HTTP requests require a lot of configuration, which can make your
application code messy. One way to clean this up is to make
"fetch components" that simplify the API to make a request.

For instance, if your application manages books, you may have these
fetch components:

```jsx
// books.js
import React from 'react';
import { Fetch } from 'react-request';
import headers from './utils/default-request-headers';
import httpAnalytics from './utils/http-analytics';

export function ReadBook({ bookId, children }) {
  return (
    <Fetch
      url={`/books/${bookId}`}
      headers={headers}
      credentials="same-origin"
      children={children}
      onResponse={httpAnalytics.responseReceived}
    />
  );
}

export function DeleteBook({ bookId, children }) {
  return (
    <Fetch
      url={`/books/${bookId}`}
      headers={headers}
      method="DELETE"
      credentials="same-origin"
      children={children}
      onResponse={httpAnalytics.responseReceived}
    />
  );
}
```

This makes it so you only need to specify things like credentials,
headers, and analytics in a single place.

You can use these components in your application like so:

```jsx
import React, { Component } from 'react';
import { readBook } from './request-components/books';

export default class App extends Component {
  render() {
    const { bookId } = this.props;

    return (
      <div>
        <h1>Welcome to My App</h1>
        <ReadBook bookId={bookId}>
          {result => {
            // Use the result here
          }}
        </ReadBook>
      </div>
    );
  }
}
```

If you've used [Redux](https://redux.js.org) for HTTP requests in the past, then you can think of the
"fetch components" as fulfilling a similar role as action creators.

### Directory Structure

We recommend organizing your fetch components by their resource type. For instance, if your app manages
books, authors, and publishers, you might have:

```
/src
  /fetch-components
    books.js
    authors.js
    publishers.js
```
