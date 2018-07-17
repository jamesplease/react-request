# React Request

[![Travis build status](http://img.shields.io/travis/jamesplease/react-request.svg?style=flat)](https://travis-ci.org/jamesplease/react-request)
[![npm version](https://img.shields.io/npm/v/react-request.svg)](https://www.npmjs.com/package/react-request)
[![Test Coverage](https://coveralls.io/repos/github/jamesplease/react-request/badge.svg?branch=master)](https://coveralls.io/github/jamesplease/react-request?branch=master)
[![gzip size](http://img.badgesize.io/https://unpkg.com/react-request/dist/react-request.min.js?compression=gzip)](https://unpkg.com/react-request/dist/react-request.min.js)

Declarative HTTP requests for React.

### Motivation

Making a single HTTP request is not difficult to do in JavaScript. However,
complex web applications often make many requests as the
user navigates through the app.

Features such as request deduplication and response caching can often save the
developer of apps like these from headache and bugs. Although it is possible to
implement these features imperatively, it requires that you write a bit of
code, and that code can be tedious to test.

A declarative API makes things a lot simpler for you, which is where React Request
comes in. React Request is a backend-agnostic, declarative solution for HTTP
requests in React, and its deduping and caching features are a delight to use.

### Features

✓ Uses the native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API  
✓ Smart [deduping of requests](./docs/guides/request-deduplication.md)  
✓ Customizable [response caching](./docs/guides/response-caching.md)  
✓ Provides hooks to integrate with external stores (such as [Redux](https://github.com/reactjs/redux))  
✓ Reasonable footprint (~2kb gzipped)

### Installation

Install using [npm](https://www.npmjs.com):

```
npm install react-request
```

or [yarn](https://yarnpkg.com/):

```
yarn add react-request
```

### Documentation

- [**Getting Started**](#getting-started)
- [**API**](#api)
  - [\<Fetch/\>](#fetch-)
    - [props](#props)
    - [Arguments passed to the render prop](#propschildren)
    - [Using `doFetch`](#using-dofetch)
  - [fetchDedupe()](#fetchdedupe-input--init--dedupeoptions-)
  - [getRequestKey()](#getrequestkey-url-method-body-responsetype-)
  - [isRequestInFlight()](#isrequestinflight-requestkey-)
  - [clearRequestCache()](#clearrequestcache)
  - [clearResponseCache()](#clearresponsecache)
- [**Guides ⇗**](./docs/guides/INDEX.md)
  - [Response Caching ⇗](./docs/guides/response-caching.md)
  - [Request Deduplication ⇗](./docs/guides/request-deduplication.md)
  - [Request Keys ⇗](./docs/guides/request-keys.md)
  - [Best Practices ⇗](./docs/guides/best-practices.md)
  - [Using the `lazy` Prop ⇗](./docs/guides/using-the-lazy-prop.md)
  - [Aborting ⇗](./docs/guides/aborting.md)
  - [Differences with `fetch()` ⇗](./docs/guides/differences-with-fetch.md)
  - [Differences with React Apollo ⇗](./docs/guides/differences-with-apollo.md)
  - [Integration with Other Technologies ⇗](./docs/guides/integration-with-other-technologies.md)
- [**Examples ⇗**](./docs/examples.md)
- [**FAQ ⇗**](./docs/FAQ.md)
- [**Roadmap ⇗**](./ROADMAP.md)
- [**Acknowledgements**](#acknowledgements)

### Getting Started

Here's a quick look at what using React Request is like:

```jsx
import React, { Component } from 'react';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch url="https://jsonplaceholder.typicode.com/posts/1">
        {({ fetching, failed, data }) => {
          if (fetching) {
            return <div>Loading data...</div>;
          }

          if (failed) {
            return <div>The request did not succeed.</div>;
          }

          if (data) {
            return (
              <div>
                <div>Post ID: {data.id}</div>
                <div>Post Title: {data.title}</div>
              </div>
            );
          }

          return null;
        }}
      </Fetch>
    );
  }
}
```

Need to make multiple requests? You can use any tool that you would like that
allows you to "compose" [render prop components](https://reactjs.org/docs/render-props.html) together. This example
uses [React Composer](https://github.com/jamesplease/react-composer):

```jsx
import React, { Component } from 'react';
import Composer from 'react-composer';

class App extends Component {
  render() {
    return (
      <Composer
        components={[
          <Fetch url="https://jsonplaceholder.typicode.com/posts/1" />,
          <Fetch
            url="https://jsonplaceholder.typicode.com/posts/1"
            method="DELETE"
          />,
        ]}>
        {([readPost, deletePost]) => {
          return (
            <div>
              {readPost.fetching && 'Loading post 1'}
              {!readPost.fetching && 'Post 1 is not being fetched'}
              <button onClick={() => deletePost.doFetch()}>
                Delete Post 1
              </button>
            </div>
          );
        }}
      </Composer>
    );
  }
}
```

These examples just scratch the surface of what React Request can do for you.
Check out the API reference below, or
[read the guides](https://github.com/jamesplease/react-request/blob/master/docs/guides/INDEX.md),
to learn more.

### API

#### `<Fetch />`

A component for making a single HTTP request. This is the export from this library that you will use
most frequently.

```jsx
import { Fetch } from 'react-request';
```

##### Props

The `<Fetch/>` components accepts every value of `init` and `input`
from the
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
API as a prop, in addition to a few other things.

The complete list of props is:

| Prop                                 | Default value    | Description                                                                                                                                                                                                                                |
| ------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| url                                  |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The URL to send the request to                                                                                                         |
| method                               | `'GET'`          | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The HTTP method to use                                                                                                                 |
| body                                 |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The request body to send along with the request                                                                                        |
| credentials                          |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The request credentials you want to use for the request: `omit`, `same-origin`, or `include.`                                          |
| headers                              |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). Headers to send along with the request                                                                                                 |
| [children](#propschildren)           |                  | A function that is called with a single argument containing information about the request. Learn more.                                                                                                                                     |
| [lazy](#propslazy)                   | _Varies_         | Whether or not the request is made when the component mounts.                                                                                                                                                                              |
| [beforeFetch](#propsbeforefetch)     |                  | A function called before a network request is made.                                                                                                                                                                                        |
| [afterFetch](#propsafterfetch)       |                  | A function that is only called after a network request is made.                                                                                                                                                                            |
| [onResponse](#propsonresponse)       |                  | A function called anytime a response is received, whether from the network or cache.                                                                                                                                                       |
| [transformData](#propstransformdata) |                  | A function that is called with the body of the response, allowing you to transform it.                                                                                                                                                     |
| [responseType](#propsresponsetype)   | `'json'`         | Whether or not the request is made when the component mounts.                                                                                                                                                                              |
| [requestName](#propsrequestname)     |                  | A name to give this request, which can be useful for debugging.                                                                                                                                                                            |
| [fetchPolicy](#propsfetchpolicy)     |                  | The cache strategy to use.                                                                                                                                                                                                                 |
| [cacheResponse](#propscacheresponse) | _Varies_         | Whether or not to cache the response for this request.                                                                                                                                                                                     |
| [dedupe](#propsdedupe)               | `true`           | Whether or not to dedupe this request.                                                                                                                                                                                                     |
| [requestKey](#propsrequestkey)       | _Generated_      | A key that is used for deduplication and response caching.                                                                                                                                                                                 |
| mode                                 |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The mode you want to use for the request                                                                                               |
| cache                                |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The browser's cache mode you want to use for the request                                                                               |
| redirect                             |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The redirect mode to use                                                                                                               |
| referrer                             | `'about:client'` | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). The referrer to use for the request                                                                                                    |
| referrerPolicy                       | `''`             | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). Specifies the value of the referer HTTP header.                                                                                        |
| integrity                            | `''`             | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). Contains the [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) value of the request |
| keepalive                            |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). Can be used to allow the request to outlive the page                                                                                   |
| signal                               |                  | From [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). An AbortSignal object instance                                                                                                         |

To learn more about the valid options for the props that come from `fetch`, refer to the
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
documentation.

The following example demonstrates some of the most commonly-used props that come from `fetch()`:

```jsx
<Fetch
  url="/posts/2"
  method="patch"
  credentials="same-origin"
  headers={{
    'csrf-token': myCsrfToken,
  }}
  body={JSON.stringify({ title: 'New post' })}>
  {({ doFetch }) => {
    <button onClick={() => doFetch()}>Update Post</button>;
  }}
</Fetch>
```

In addition to the `fetch()` props, there are a number of other useful props.

##### `props.children`

`children` is the [render prop](https://reactjs.org/docs/render-props.html) of this component.
It is called with one argument, `result`, an object with the following keys:

| Key         | Type     | Description                                                                                                                                                                                                                                                                                                             |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetching    | Boolean  | A Boolean representing whether or not a request is currently in flight for this component                                                                                                                                                                                                                               |
| failed      | Boolean  | A Boolean representing whether or not the request failed for any reason. This includes network errors and status codes that are greater than or equal to`400`.                                                                                                                                                          |
| error       | Object   | An error object representing a network error occurred. Note that HTTP "error" status codes do not cause errors; only failed or aborted network requests do. For more, see the ["Using Fetch" MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful). |
| response    | Object   | An instance of [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). The [`body`](https://developer.mozilla.org/en-US/docs/Web/API/Body) will already be read, and made available to you as `response.data`.                                                                                           |
| data        | Object   | The data returned in `response`. This will be different from `response.data` if a `transformData` prop was passed to `<Fetch/>`.                                                                                                                                                                                        |
| doFetch     | Function | A function that allows you to manually make the HTTP request. [Read more.](#using-dofetch)                                                                                                                                                                                                                              |
| url         | String   | The URL that was passed as a prop to `<Fetch />`                                                                                                                                                                                                                                                                        |
| requestName | String   | The name of the request (see `requestName` below)                                                                                                                                                                                                                                                                       |
| requestKey  | String   | The [request key](./docs/guides/request-keys.md) of the request                                                                                                                                                                                                                                                         |

###### Using doFetch

There are three common use cases for the `doFetch` prop:

- You can use it to "refresh" the data by making a follow-up request for read requests
- You can use it to retry the request if there is any sort of error
- You must manually call this method to actually make the request anytime that the `lazy` prop
  is passed as `true`.

`doFetch` accepts one argument: `options`. Any of the `fetch()` options, such as `url`, `method`, and
`body` are valid `options`. You may also specify a new `requestKey` if you are manually generating your
own keys. This method allows you to customize the request from within the component based on the
component's state.

`doFetch` returns a Promise that **always** resolves. It resolves to the same argument that the
[`afterFetch`](#afterFetch) prop receives.

In the following example, we demonstrate how you can modify the request by passing options to `doFetch`.

```jsx
<Fetch {...props}>
  {({ doFetch }) => (
    // You can pass options to `doFetch` to customize the request. All of the props from `fetch()`, such as `url`,
    // `body`, and so on, are supported.
    <button onClick={() => doFetch({ body: this.getResponseBody() })}>
      Perform Action
    </button>
  )}
</Fetch>
```

##### `props.lazy`

Whether or not the request will be called when the component mounts. The default value
is based on the request method that you use.

| Method                   | Default value |
| ------------------------ | ------------- |
| GET, HEAD, OPTIONS       | `false`       |
| POST, PUT, PATCH, DELETE | `true`        |

```jsx
<Fetch url="/books" lazy>
  {({ doFetch }) => {
    <button onClick={() => doFetch()}>Load the books</button>;
  }}
</Fetch>
```

##### `props.beforeFetch`

A function that is called just before a network request is initiated. It is called
with one argument, an object with the following keys:

- `url`: The URL of the request
- `init`: The second argument passed to `global.fetch()`, which specifies things
  such as the body, method, and so on
- `requestKey`: Either the computed request key, or the value of the
  `requestKey` prop

This feature is useful for analytics, or syncing response data with a data store such
as [Redux](https://github.com/reactjs/redux/).

> Note: This function is not called when the component reads from the cache.

##### `props.afterFetch`

A function that is called anytime that a network response is received. It is called
with one argument, an object with the following keys:

- `url`: The URL of the request
- `init`: The second argument passed to `global.fetch()`, which specifies things
  such as the body, method, and so on
- `requestKey`: Either the computed request key, or the value of the
  `requestKey` prop
- `response`: The response that was received from the HTTP request
- `data`: The transformed data from the response. This will be different from
  `response.data` if a `transformData` function was passed as a prop to `<Fetch/>`.
- `error`: An error returned from the HTTP request
- `didUnmount`: A Boolean representing whether or not the component has unmounted

This can be used for analytics or syncing response data with a data store such
as [Redux](https://github.com/reactjs/redux/).

> Note: This function is not called when the component reads from the cache.

##### `props.onResponse`

A function that is called every time a response is received, whether that
response is from the cache or from a network request. Receives two arguments:
`error` and `response`.

```jsx
<Fetch
  url="/posts/2"
  onResponse={(error, response) => {
    if (error) {
      console.log('Ruh roh', error);
    } else {
      console.log('Got a response!', response);
    }
  }}>
  {() => {
    <div>Hello</div>;
  }}
</Fetch>
```

##### `props.transformData`

A function that is called with the data returned from the response. You can use this
hook to transform the data before it is passed into `children`.

```jsx
<Fetch
  url="/posts/2"
  transformData={data => data.post>
  {({ fetching, error, response, data }) => {
    <div>
      {fetching && ('Loading...')}
      {error && ('There was an error.')}
      {!fetching && !error && response.status === 200 && (
        <div>
          <h1>{data.title}</h1>
          <div>{data.content}</div>
        </div>
      )}
    </div>
  }}
</Fetch>
```

> Note: `transformData` does not modify the value of `response.data`. The transformed data is
> made available to you in the [render prop argument](#children) under the `data` key.

##### `props.responseType`

The content type of the response body. Defaults to `"json"` unless the response has a 204 status code,
in which case it will be `"text"` instead. Valid values are any of the methods on
[Body](https://developer.mozilla.org/en-US/docs/Web/API/Body).

Alternatively, you may specify a function that returns a string. The function will be called with one
argument: `response`. This allows you to dynamically specify the response type based on information
about the response, such as its status code.

```jsx
// If you have an endpoint that just returns raw text, you could, for instance, convert it into
// an object using `responseType` and `transformData`.
<Fetch
  url="/countries/2"
  responseType="text"
  transformData={countryName => {
    return {
      countryName,
    };
  }}>
  {({ data }) => {
    if (data) {
      return <div>{data.countryName}</div>;
    }

    return null;
  }}
</Fetch>
```

If the response body cannot be parsed as the `responseType` that you specify, then `data` will
be set to `null`.

##### `props.requestName`

A name to give this request, which can help with debugging purposes. The request name is
analogous to a function name in JavaScript. Although we could use anonymous functions
everywhere, we tend to give them names to help humans read and debug the code.

```jsx
<Fetch url={`/posts/${postId}`} requestName="readPost" />
```

> Note: This feature is analogous to the [operation name](http://graphql.org/learn/queries/#operation-name) in GraphQL.

##### `props.fetchPolicy`

This determines how the request interacts with the cache. Valid options are:

- `"cache-first"`
- `"cache-and-network"`
- `"network-only"`
- `"cache-only"`

For documentation on what each of these values do, refer to the [response caching guide](./docs/guides/response-caching.md).

The default value of this prop is based on the value of the `method` prop that you pass to `<Fetch/>`.

| Method                   | Default value    |
| ------------------------ | ---------------- |
| GET, HEAD, OPTIONS       | `"cache-first"`  |
| POST, PUT, PATCH, DELETE | `"network-only"` |

> This prop behaves identically to the Apollo prop
> [with the same name](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy).

##### `props.cacheResponse`

Whether or not the response will be cached. The default value is based on the value of the `method` prop that you pass
to `<Fetch/>`.

| Method                   | Default value |
| ------------------------ | ------------- |
| GET, HEAD, OPTIONS       | `true`        |
| POST, PUT, PATCH, DELETE | `false`       |

For documentation on this prop, refer to the [response caching guide](./docs/guides/response-caching.md).

##### `props.dedupe`

A Boolean value representing whether or not the request should be
[deduplicated](./docs/guides/request-deduplication.md).
Defaults to `true`.

##### `props.requestKey`

A string that is used to control the request deduplication and response caching features. By default,
a key is generated for you. Specifying a custom key is an advanced feature that you may not need.

For more, see the [request key](https://github.com/jamesplease/react-request/blob/master/docs/guides/request-keys.md)
guide.

---

The rest of the API documentation describes the other named exports from the `react-request` package. Typically,
you won't need to use these, but they are available should you need them.

#### `fetchDedupe( input [, init] [, dedupeOptions] )`

This is the `fetchDedupe` export from the [Fetch Dedupe](https://github.com/jamesplease/fetch-dedupe)
library. Fetch Dedupe powers the request deduplication in React Request.

Whenever you need to make a standalone HTTP request outside of the
`<Fetch />` component, then you can use this with confidence that you won't send a
duplicate request.

For more, refer to [the documentation of fetch-dedupe](https://github.com/jamesplease/fetch-dedupe).

#### `getRequestKey({ url, method, body, responseType })`

Generates a request key. All of the values are optional. You typically never need to use this, as request
keys are generated automatically for you when you use React Request or Fetch Dedupe.

This method comes from [`fetch-dedupe`](https://github.com/jamesplease/fetch-dedupe).

#### `isRequestInFlight( requestKey )`

Return a Boolean representing if a request for `requestKey` is in flight or not.

This method comes from [`fetch-dedupe`](https://github.com/jamesplease/fetch-dedupe).

#### `clearRequestCache()`

Wipes the cache of deduped requests. Mostly useful for testing.

This method comes from [`fetch-dedupe`](https://github.com/jamesplease/fetch-dedupe).

> Note: this method is not safe to use in application code.

#### `clearResponseCache()`

Wipes the cache of cached responses. Mostly useful for testing.

> Note: this method is not safe to use in application code.

### Acknowledgements

This library was inspired by [Apollo](https://www.apollographql.com). The
library [Holen](https://github.com/tkh44/holen) was referenced during the
creation of this library.
