# React Request

A library for making HTTP requests with React. Inspired by React Apollo.

### Motivation

React Apollo exports a higher-order component that makes network requests for
you. Although Apollo is designed to work specifically with GraphQL, many of the
features of React Apollo make sense for generic HTTP requests.

This component abstracts those features into a generic HTTP component.

### Features

✓ Uses the native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API  
✓ Smart deduping of requests  
✓ Powerful and customizable response caching  
✓ Polling (coming soon)  
✓ Tiny footprint

### Installation

Install using yarn or npm:

```
npm install react-request

yarn add react-request
```

### Getting Started

Here's a simple example of using React Request.

```js
import Request from 'react-request';

class App extends Component {
  render() {
    return (
      <Request
        url="https://jsonplaceholder.typicode.com/posts/1"
        render={({ fetching, error, data }) => {
          if (fetching) {
            return <div>Loading data...</div>;
          }

          if (error) {
            return <div>There was a network error.</div>;
          }

          return (
            <div>
              <div>Post ID: {data.id}</div>
              <div>Post Title: {data.title}</div>
            </div>
          );
        }}
      />
    );
  }
}
```

> Note: this example will shadow the `window.Request` constructor. Most people
> do not use that, but you may prefer to use another name, such as `Req`, instead.

### API

Documentation coming soon.

### Acknowledgements

This library was inspired by [Apollo](https://www.apollographql.com). The
library [Holen](https://github.com/tkh44/holen) was referenced during the
creation of this library.
