# Throttling and Debouncing

This guide will cover three strategies to throttle or debounce requests. The first
two use `<Fetch/>`, and the third will use `fetchDedupe()`.

### `<Fetch/>`: Using a closure

This solution works if you are able to make the `<Fetch/>` lazy, _and_ if you
want to debounce or throttle the `doFetch` prop.

The way it works is that you use your preferred throttle or debouncing solution
to generate a debounced function that you pass `doFetch` _into_.

Let's take a look:

```jsx
import React from 'react';
import { Fetch } from 'react-request';
import { debounce } from 'lodash';

// Utilizing closures to debounce functions from props.
// If debounce is applied within the component, the "debounced function"
// will change each time. By defining it statically here, react will always
// consider this to be the same function.
const debounceCall = debounce(func => func(), 250);

const SomeComponent = () => (
  <Fetch lazy url="/authors/2">
    ({doFetch} => ({
      <button onClick={debounceCall(doFetch)}>
        Refresh Author Details
      </button>
    }))
  </Fetch>
);
```

> Thanks to [@sfarthin](https://github.com/sfarthin) for suggesting this
> solution over on
> [the Apollo project](https://github.com/apollographql/react-apollo/issues/450#issuecomment-354448303).

### Using [react-debounce-render](https://github.com/podefr/react-debounce-render)

This solution works by debouncing the rendering of the component itself. This works
when you are trying to debounce the HTTP request that is made due to props changing.

A potential downside is that it likely debounces the rendering of the components rendered
_within_ the `<Fetch/>` as well, which _could_ cause your UI to appear to lag when it
should be updating. Note that I haven't verified this; I am just making a prediction
about the behavior.

Let's take a look at an example:

```jsx
import debounceRender from 'react-debounce-render';

const debouncedMyReactComponent = debounceRender(
  // Presumably, `<Fetch/>` would take some dynamic props.
  // In this situation, we are just passing it a static value.
  <Fetch url="/people/2"/>
);
```

### Using `fetchDedupe()`

