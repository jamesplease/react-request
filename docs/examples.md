# Examples

A number of examples are distributed with the library's
[source code](https://github.com/jmeas/react-request).

### Simple Read

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/simple-read
npm install
npm start

open http://localhost:3000/
```

This example shows a simple request that fetches a single resource
when the component mounts.

### Lazy Read

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/lazy-read
npm install
npm start

open http://localhost:3000/
```

In this example, the request is defined as lazy, so it isn't made
when the component first mounts. Instead, the user of the application
must click a button to make the request.

### Updating a Resource

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/updating-a-resource
npm install
npm start

open http://localhost:3000/
```

Requests with the headers `POST`, `PUT`, `PATCH`, or `DELETE` are lazy
by default. This example demonstrates how these sorts of requests are
typically used in your application.

### Multiple Requests

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/multiple-requests
npm install
npm start

open http://localhost:3000/
```

Sometimes, you will need access to multiple requests at the same time. This
example demonstrates using the [React Composer](https://github.com/jmeas/react-composer)
library to do that.

### Request Deduplication

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/request-deduplication
npm install
npm start

open http://localhost:3000/
```

This example demonstrates how many requests of the same kind are deduplicated by default.

### Response Caching

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/response-caching
npm install
npm start

open http://localhost:3000/
```

Response caching comes built into React Request. This example shows the default
`fetchPolicy` that returns data from the cache when it is available, rather than
making a second request.

### Fetch Components

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/fetch-components
npm install
npm start

open http://localhost:3000/
```

Often times, configuring HTTP requests requires, well, a lot of configuration, such as headers,
the URL, and the cache policy.

Rather than repeating this throughout your app, you can clean things up by creating "fetch components,"
an organizational strategy where the `<Fetch/>` components themselves are placed into standalone files.
