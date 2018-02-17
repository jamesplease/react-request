# Best Practices

Here are some tips that may help you when using React Request.

### Handling errors

The `failed` Boolean is passed to the `children` callback, which
represents whether _any_ error occurred with the request. This includes
network requests or status codes greater than or equal to 400.

This Boolean is convenient for a coarse understanding that the network
failed, but using this Boolean alone is typically not enough to provide
a great user experience. A user may want to know why the request
failed. Was the resource not found? Did the user submit bad information?
Was there a network error? Was the user logged out?

We encourage you to dig into the `error` and `response` objects
to provide your users with a more detailed explanation of what went wrong,
rather than displaying a generic "There was an error" message.

Here is an example that shows the different kinds of ways that a response
can error.

```js
<Fetch {...fetchProps}>
  {({ failed, error, response }) => {
    if (failed) {
      console.log('There was _some_ kind of error. What happened?');
    }

    if (error) {
      console.log('There was a network error');

      if (navigation.onLine) {
        console.log('The user lost internet connection.');
      } else {
        // You can look at the Error to learn more.
        console.log('The request was aborted, or it timed out');
      }
    }

    const status = response && response.status;

    if (status === 404) {
      console.log('The resource was not found.');
    } else if (status === 401) {
      console.log('You user have been logged out.');
    } else if (status === 400) {
      console.log('Invalid data was submitted');
    } else if (status === 500) {
      console.log('Something went wrong on the server.');
    }
  }}
</Fetch>
```

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
"fetch components" as fulfilling a similar role as action creators. They cut down on the boilerplate.

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

Within each of those resource files, you might have multiple "fetch components" for reading and updating
the resources in various ways.
