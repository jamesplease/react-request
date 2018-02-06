# Best Practices

Here are some tips for using React Request.

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
