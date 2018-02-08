# Roadmap

This roadmap outlines future changes to React Request.

* [ ] The caching implementation will be moved to `fetch-dedupe`. This is a non-breaking change.
* [ ] Caching and deduplication will support an array, allowing for a more sophisticated system that
      supports multi-operational HTTP requests (GraphQL, for instance)
* [ ] Implement "true" aborting rather than the "fake" aborting currently in the lib
* [ ] Add an Abort API
