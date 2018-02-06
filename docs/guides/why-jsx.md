# Why JSX?

It may seem weird to use React Components / JSX to make network requests. I completely understand.

I first saw this pattern in React Apollo, and I thought it was weird. However, I had heard good
things about Apollo, so I set my first impressions aside and did my best to understand why someone
would prefer to configure their requests with JSX.

I came to realize that the primary benefit to me is that I would write less code by configuring my
requests with JSX. I like writing less code, so I made React Request.

There are three things React Request does that, taken together, lead me to write less code:

* Manage response caching
* Manage request deduplication
* When using Redux, it reduces the number of connected components that I write

### Response Caching

Managing caching requires writing additional code to your components. A system for caching requests is not
necessarily difficult to create, but it does add extra code to your application.

With React Request, a response cache comes built in, and interactions with it are configured with a single prop,
`fetchPolicy`.

The full guide on response caching can be read [here](./response-caching.md).

### Request Deduplication

If you're writing a small application, then you may be able to make HTTP requests in, say, `componentDidMount`,
and then just access the data from state. You probably don't need something like Redux or React Request.

As your application grows, the time may come when more than one component will need to access the same
piece of data that came from the server. There's no guarantee that these components will be near one
another within the component tree, so using props to pass the data around may not be preferable. There are
two solutions to this problem:

1. Fetch the data in a common ancestor component that is higher up, and then pass it down to any
   component that needs it
2. Fetch the data in every component that needs it

Until the new context API is finalized, the first item on the list isn't straightforward to do without
introducing additional libraries like [react-broadcast](https://github.com/ReactTraining/react-broadcast).

The second approach can lead to duplicate requests without a system for deduping requests. React Request
comes with request deduplication, so you never need to worry about the same request being in flight at
the same time.

[This guide](./request-deduplication.md) that explains request deduplication in greater depth.

### Fewer connected components

I love Redux, but I am always open to new ways to write less Redux boilerplate. If you use Redux
for storing your remote data, then you may do something like this:

```js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { readBook } from '../redux/books/action-creators';

class App extends Component {
  render() {
    const { isFetchingBook, book } = this.props;

    return (
      <div>
        {isFetchingBook && 'Loading book...'}
        {!isFetchingBook && (
          <div>
            <h1>{book.title}</h1>
            <h2>{book.author}</h2>
          </div>
        )}
      </div>
    );
  }

  componentDidMount() {
    this.props.readBook(this.props.bookId);
  }
}

function mapStateToProps(state, props) {
  return {
    isFetchingBook: state.books.fetching,
    book: state.books.resources[props.bookId]
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      readBook
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

In my opinion, this is not bad code, but it is a bit of code. The React Request version is
less code:

```js
import React, { Component } from 'react';
import { ReadBook } from '../request-components/books';

export default ({ bookId }) => {};

class App extends Component {
  render() {
    return (
      <ReadBook bookId={this.props.bookId}>
        {({ fetching, data }) => (
          <div>
            {fetching && 'Loading book...'}
            {!fetching && (
              <div>
                <h1>{data.title}</h1>
                <h2>{data.author}</h2>
              </div>
            )}
          </div>
        )}
      </ReadBook>
    );
  }
}
```

The neat part about this is that you can still use React Request with Redux. The `ReadBook` component
in the above example can dispatch the action creator under-the-hood that adds in the book data to
the store. To see the source of ReadBook (it's not very big), refer to the
[Best Practices](./best-practices.md) guide, which covers fetch components.

### Alternatives

There may be other ways to get these features without using JSX. If so, that is awesome. I would love
to see that. For now, I find that configuring requests with JSX minimizes the code that I write when
it comes to network requests.
