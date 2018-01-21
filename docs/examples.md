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

### Fetch Composer

To run this example:

```
git clone https://github.com/jmeas/react-request.git

cd react-request/examples/fetch-composer
npm install
npm start

open http://localhost:3000/
```

Sometimes, you will need access to multiple requests at the same time. This
example demonstrates using the Fetch Composer to do that.
