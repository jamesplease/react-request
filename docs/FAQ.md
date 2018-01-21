# FAQ

Here are some answers to common questions. Don't see yours here?
[Open an issue](https://github.com/jmeas/react-request/issues/new) and
we would be happy to help.

#### Why would you use JSX for making HTTP requests?

We were skeptical at first, too, but it turns out that many of the complex things people do with HTTP requests map nicely to the
component lifecycle. You can remove a considerable amount of code from your application by declaratively specifying how you want
your requests to behave through JSX.

#### If a request is made when the component mounts, how does that work for POST, PATCH, or DELETE requests?

The default behavior is that requests are only made on mount for `GET` requests when the component mounts, but
not for those other HTTP methods.

One of the things that are passed into the render prop is a method called `fetch`. Calling this method will perform
the request. This allows you to hook up, say, PATCH requests to a button.

This behavior can be customized with the `lazy` prop.

#### What if I just want a regular fetch component without the deduplication and other "extra" features from React Request?

Take a look at [Holen](https://github.com/tkh44/holen).

#### What about normalization of data? Apollo does this.

That requires a definition of what a resource is, which is a little bit opinionated for this library.
In the future, there will be bindings between this library and
[Redux Resource](https://redux-resource.js.org), which will allow for features such as data normalization.

#### Why isn't this a higher-order component like Apollo's `graphql`?

The render prop pattern is more powerful than Higher Order Components. Read
[this post](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) for more.

#### Why is the prop named `render` rather than `children`?

Although there are a handful of arguments for the render prop to be `render` rather than `children`, this library will
likely end up using whatever pattern the [new Context API](https://github.com/reactjs/rfcs/pull/2) uses.

#### Why is there a compose component, when that doesn't exist in Apollo?

Apollo has the benefit of assuming a GraphQL API, which allows you to easily concatenate multiple queries into a single, larger query.
Typical APIs are resource-based, which means it sometimes takes more than one request to get all of the information you need for the page.

#### How do you put the response on context?

You must do it manually now, but in the future we may add a prop to do this automatically. It will likely need to wait until
[the new Context API](https://github.com/reactjs/rfcs/pull/2) is finalized and released.

We recommend using [React Broadcast](https://github.com/ReactTraining/react-broadcast) for now.
