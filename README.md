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
✓ Compose requests  
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
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch
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

Need to make multiple requests? We got you.

```js
import { FetchComposer } from 'react-request';

class App extends Component {
  render() {
    return (
      <FetchComposer
        requests={[
          <Fetch url="https://jsonplaceholder.typicode.com/posts/1" />,
          <Fetch url="https://jsonplaceholder.typicode.com/posts/2" />,
          <Fetch url="https://jsonplaceholder.typicode.com/posts/3" />
        ]}
        render={([postOne, postTwo, postThree]) => {
          return (
            <div>
              <div>
                {postOne.fetching && 'Loading post 1'}
                {!postOne.fetching && 'Post 1 has been fetched'}
              </div>
              <div>
                {postTwo.fetching && 'Loading post 2'}
                {!postTwo.fetching && 'Post 2 has been fetched'}
              </div>
              <div>
                {postThree.fetching && 'Loading post 3'}
                {!postThree.fetching && 'Post 3 has been fetched'}
              </div>
            </div>
          );
        }}
      />
    );
  }
}
```

These examples just scratch the surface of what you can do with React Request.
Check out the API reference below for more.

### API

This library has two exports:

* `Fetch`: A component for making a single HTTP request
* `FetchComposer`: A component for making parallel HTTP requests

#### `<Fetch />`

A component for making a single HTTP request. It accepts every value of `init` and `input`
from the `fetch()` API as a prop, in addition to a few other things.

Props from the `fetch()` method are:

* `url`
* `method`: defaults to `"GET"`
* `body`
* `credentials`
* `headers`
* `mode`
* `cache`
* `redirect`
* `referrer`: defaults to `"about:client"`
* `referrerPolicy`: defaults to `""`
* `integrity`: defaults to `""`
* `keepalive`
* `signal`

To learn more about the valid options for these props, refer to the
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
documentation.

An example demonstrating some common values is:

```jsx
<Fetch
  url="/posts/2"
  method="PATCH"
  credentials="same-origin"
  headers={{
    'csrf-token': myCsrfToken
  }}
  body={JSON.stringify({ title: 'New post' })}
  render={({ fetch }) => {
    <button onClick={() => fetch()}>
      Update Post
    </div>
  }}
/>
```

In addition to the `fetch()` props, there are a handful of other props.

##### `contentType`

The content type of the response body. Defaults to `json`. Valid options are the methods
on [Body](https://developer.mozilla.org/en-US/docs/Web/API/Body).

##### `render`

The "render prop" of this component. It is called with one argument, `result`, an object
with the following keys:

* `fetching`: A Boolean representing whether or not a request is currently in flight for this component
* `error`: A Boolean representing if a network error occurred. Note that HTTP "error" status codes do not
  cause `error` to be `true`; only failed or aborted network requests do.
* `response`: An instance of [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). The
  `body` will already be read, and made available to you via `response.data`.
* `data`: An alias of `response.data`
* `fetch`: A function that makes the HTTP request. See notes below.
* `requestName`: The name of the request (see `requestName` below)

There are three common use cases for the `fetch` prop:

* For GET requests, it can allow users to refresh the data
* Anytime there is a network error, you can use this function to retry the request
* When `lazy` is `true`, you can use this to actually make the request, typically as
  a result of user input

`fetch` accepts one argument: `options`. Any of the `fetch()` options described above are valid
`options`. This allows you to customize the request from within the component.

##### `lazy`

Whether or not the request will be called when the component mounts. The default value
is based on the request method that you use.

| Method              | Default value |
| ------------------- | ------------- |
| GET, HEAD, OPTIONS  | `false`       |
| POST, PATCH, DELETE | `true`        |

##### `onResponse`

A function that is called when a request is received. Receives two arguments: `error` and `response`.

```jsx
<Fetch
  url="/posts/2"
  onResponse={(error, response) => {
    if (error) {
      console.log('Ruh roh', error);
    } else {
      console.log('Got a response!', response);
    }
  }}
  render={() => {
    <div>Hello</div>;
  }}
/>
```

##### `transformData`

A function that is called with the data returned from the response. You can use this
hook to transform the data before it is passed into `render`.

```jsx
<Fetch
  url="/posts/2"
  transformData={data => {
    return data.post;
  }
  render={({ fetching, error, response, data }) => {
    <div>
      {fetching && ('Loading...')}
      {error && ('There was an error.')}
      {!fetching && !error && response.status === 200 && (
        <div>
          <h1>{data.title}</h1>
          <div>{data.content}</h1>
        </div>
      )}
    </div>
  }}
/>
```

##### `requestName`

A name to give this request which can help with debugging purposes. The request name is
analogous to a function name in JavaScript. Although we could use anonymous functions
everywhere, we tend to give them names to help humans read and debug the code.

```jsx
<Fetch url={`/posts/${postId}`} requestName="readPost" />
```

##### `fetchPolicy`

This determines how the request interacts with the cache. For documentation, refer to the
[Apollo documentation](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy).
This prop is identical to the Apollo prop.

(The API will be listed here shortly).

#### `<FetchComposer />`

A component that simplifies making parallel requests.

##### `requests`

An array of `Fetch` components. Use any of the above props, but leave out `render`.

> Note: if you pass a `render` prop, it will be ignored.

##### `render`

A function that is called with the array of responses from `requests`.

### Acknowledgements

This library was inspired by [Apollo](https://www.apollographql.com). The
library [Holen](https://github.com/tkh44/holen) was referenced during the
creation of this library.
