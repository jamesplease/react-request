# React Request

A library for making HTTP requests with React. Inspired by React Apollo.

### Motivation

[React Apollo](https://github.com/apollographql/react-apollo) exports
[a higher-order component](https://www.apollographql.com/docs/react/basics/setup.html#graphql)
that makes network requests for you. Although Apollo is designed to work
specifically with [GraphQL](http://graphql.org), many of the features of React
Apollo make sense outside of that context.

This library abstracts those features into a generic HTTP component.

### Features

✓ Uses the native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API  
✓ Smart deduping of requests  
✓ Powerful and customizable response caching  
✓ Polling (coming soon)  
✓ Small footprint (~2kb gzipped)

### Installation

Install using [npm](https://www.npmjs.com):

```
npm install react-request
```

or [yarn](https://yarnpkg.com/):

```
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

> Note: the name given to this library in the above example will shadow the
> [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)
> constructor. Most people do not use the Request constructor directly, but if
> you prefer it you can use another name, such as `Req`, instead.

### API

Documentation coming soon.

### Acknowledgements

This library was inspired by [Apollo](https://www.apollographql.com). The
library [Holen](https://github.com/tkh44/holen) was referenced during the
creation of this library.
