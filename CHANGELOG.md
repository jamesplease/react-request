# Changelog

### v0.2.0 (2018/1/2)

**New Features**

* The render prop will now be passed the `requestKey`.

### v0.1.0 (2018/1/2)

React's new Context API has been finalized, and it uses functional `children` rather than a prop
named `render`. Accordingly, this library has been updated to use `children` as the default.

**Breaking**

* `<Fetch/>` now uses `children` as the render prop, rather than `render`.
