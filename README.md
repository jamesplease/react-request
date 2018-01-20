# React Request

A library for making requests with React. Inspired by React Apollo.

### Motivation

React Apollo exposes a higher-order component for Apollo. It is responsible for making
network requests for you. Although Apollo is built specifically for GraphQL,
many of the features of React Apollo are not unique to GraphQL.

This component abstracts those features into a generic HTTP component.

### Features

✓ Deduplication of network requests
✓ Smart caching features
✓ Polling (coming soon)

### Installation

Install using yarn or npm:

```
npm install react-request

yarn add react-request
```

### Getting Started

This is a simple example of using the component. It uses
a freely-avaiable API, so you can put it into your application
and test it out.

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

> Note: this example will shadow the `window.Request` constructor. Most people do not
> use that, but you may prefer to use another name, such as `Req`, instead.

### API

Documentation coming soon.
