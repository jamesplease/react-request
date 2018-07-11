import React from 'react';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import { jsonResponse } from './responses';
import { Fetch, clearRequestCache, clearResponseCache } from '../src';

// Some time for the mock fetches to resolve
const networkTimeout = 10;

beforeEach(() => {
  clearRequestCache();
  clearResponseCache();
});

describe('doFetch()', () => {
  test('`doFetch()` returns a promise that resolves with the same object as `afterFetch`', done => {
    fetchMock.get(
      '/test/succeeds/dofetch-promise',
      new Promise(resolve => {
        resolve(jsonResponse());
      })
    );

    expect.assertions(2);
    const afterFetchMock = jest.fn();
    const childrenMock = jest.fn();

    mount(
      <Fetch
        url="/test/succeeds/dofetch-promise"
        afterFetch={afterFetchMock}
        children={childrenMock}
        lazy
      />
    );

    const { doFetch } = childrenMock.mock.calls[0][0];
    doFetch().then(afterFetchInfo => {
      setTimeout(() => {
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(afterFetchInfo);
        done();
      });
    });
  });

  test('`doFetch()` returns a promise that resolves _even_ when there was an error', done => {
    fetchMock.get(
      '/test/fails/dofetch-promise',
      new Promise((resolve, reject) => {
        reject({
          message: 'Network error',
        });
      })
    );

    expect.assertions(1);
    const childrenMock = jest.fn();

    mount(<Fetch url="/test/fails/dofetch-promise" children={childrenMock} />);

    const { doFetch } = childrenMock.mock.calls[0][0];
    doFetch().then(afterFetchInfo => {
      expect(afterFetchInfo).toMatchObject({
        url: '/test/fails/dofetch-promise',
        error: {
          message: 'Network error',
        },
        failed: true,
        didUnmount: false,
        data: null,
      });
      done();
    });
  });
});

describe('same-component doFetch() with caching (gh-151)', () => {
  test('doFetch() with URL and another HTTP method', done => {
    // expect.assertions(8);
    const onResponseMock = jest.fn();
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

    let run = 1;
    let renderCount = 0;

    mount(
      <Fetch
        url="/test/succeeds/json-one"
        requestKey="1"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
        onResponse={onResponseMock}>
        {options => {
          renderCount++;

          // Wait for things to be placed in the cache.
          // This occurs on the third render:
          // 1st. component mounts
          // 2nd. fetch begins
          // 3rd. fetch ends
          if (run === 1 && renderCount === 3) {
            expect(options).toEqual(
              expect.objectContaining({
                fetching: false,
                data: {
                  books: [1, 42, 150],
                },
                error: null,
                failed: false,
                requestName: 'anonymousRequest',
                url: '/test/succeeds/json-one',
              })
            );

            // We need a timeout here to prevent a race condition
            // with the assertions after the component mounts.
            setTimeout(() => {
              run++;
              renderCount = 0;
              options.doFetch({
                method: 'patch',
                url: '/test/succeeds/patch',
              });

              // Now we need another timeout to allow for the fetch
              // to occur.
              setTimeout(() => {
                done();
              }, networkTimeout);
            }, networkTimeout * 2);
          }

          if (run === 2) {
            if (renderCount === 1) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: true,
                  data: {
                    books: [1, 42, 150],
                  },
                  error: null,
                  failed: false,
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/patch',
                })
              );
            }
            if (renderCount === 2) {
              expect(fetchMock.calls('/test/succeeds/patch').length).toBe(1);
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: false,
                  data: {
                    movies: [1],
                  },
                  error: null,
                  failed: false,
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/patch',
                })
              );
            }
            if (renderCount === 3) {
              done.fail();
            }
          }
        }}
      </Fetch>
    );

    setTimeout(() => {
      // NOTE: this is for adding stuff to the cache.
      // This DOES NOT test the cache-only behavior!
      expect(fetchMock.calls('/test/succeeds/json-one').length).toBe(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/json-one',
          error: null,
          failed: false,
          didUnmount: false,
          data: {
            books: [1, 42, 150],
          },
        })
      );
      expect(onResponseMock).toHaveBeenCalledTimes(1);
      expect(onResponseMock).toBeCalledWith(
        null,
        expect.objectContaining({
          ok: true,
          status: 200,
          statusText: 'OK',
          data: {
            books: [1, 42, 150],
          },
        })
      );
    }, networkTimeout);
  });

  test('doFetch() with request key and URL', done => {
    // expect.assertions(8);
    const onResponseMock = jest.fn();
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

    let run = 1;
    let renderCount = 0;

    mount(
      <Fetch
        url="/test/succeeds/json-one"
        requestKey="1"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
        onResponse={onResponseMock}>
        {options => {
          renderCount++;

          // Wait for things to be placed in the cache.
          // This occurs on the third render:
          // 1st. component mounts
          // 2nd. fetch begins
          // 3rd. fetch ends
          if (run === 1 && renderCount === 3) {
            expect(options).toEqual(
              expect.objectContaining({
                fetching: false,
                data: {
                  books: [1, 42, 150],
                },
                error: null,
                failed: false,
                requestName: 'anonymousRequest',
                url: '/test/succeeds/json-one',
              })
            );

            // We need a timeout here to prevent a race condition
            // with the assertions after the component mounts.
            setTimeout(() => {
              run++;
              renderCount = 0;

              options.doFetch({
                requestKey: 'sandwiches',
                url: '/test/succeeds/json-two',
              });

              // Now we need another timeout to allow for the fetch
              // to occur.
              setTimeout(() => {
                done();
              }, networkTimeout);
            }, networkTimeout * 2);
          }

          if (run === 2) {
            if (renderCount === 1) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: true,
                  data: {
                    books: [1, 42, 150],
                  },
                  error: null,
                  failed: false,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            }
            if (renderCount === 2) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: false,
                  data: {
                    authors: [22, 13],
                  },
                  error: null,
                  failed: false,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            }
            if (renderCount === 3) {
              done.fail();
            }
          }
        }}
      </Fetch>
    );

    setTimeout(() => {
      // NOTE: this is for adding stuff to the cache.
      // This DOES NOT test the cache-only behavior!
      expect(fetchMock.calls('/test/succeeds/json-one').length).toBe(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/json-one',
          error: null,
          failed: false,
          didUnmount: false,
          data: {
            books: [1, 42, 150],
          },
        })
      );
      expect(onResponseMock).toHaveBeenCalledTimes(1);
      expect(onResponseMock).toBeCalledWith(
        null,
        expect.objectContaining({
          ok: true,
          status: 200,
          statusText: 'OK',
          data: {
            books: [1, 42, 150],
          },
        })
      );
    }, networkTimeout);
  });

  // Note: this does not test dedupe due to the fact that the requests
  // resolve too quickly.
  test('doFetch(); testing cancelation', done => {
    // expect.assertions(8);
    const onResponseMock = jest.fn();
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

    let run = 1;
    let renderCount = 0;

    mount(
      <Fetch
        url="/test/succeeds/json-one"
        requestKey="1"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
        onResponse={onResponseMock}>
        {options => {
          renderCount++;

          // Wait for things to be placed in the cache.
          // This occurs on the third render:
          // 1st. component mounts
          // 2nd. fetch begins
          // 3rd. fetch ends
          if (run === 1 && renderCount === 3) {
            expect(options).toEqual(
              expect.objectContaining({
                fetching: false,
                data: {
                  books: [1, 42, 150],
                },
                error: null,
                failed: false,
                requestName: 'anonymousRequest',
                url: '/test/succeeds/json-one',
              })
            );

            // We need a timeout here to prevent a race condition
            // with the assertions after the component mounts.
            setTimeout(() => {
              run++;
              renderCount = 0;

              options.doFetch({
                requestKey: 'sandwiches',
                url: '/test/succeeds/json-two',
              });

              options.doFetch({
                requestKey: 'sandwiches',
                url: '/test/succeeds/json-two',
              });

              // Now we need another timeout to allow for the fetch
              // to occur.
              setTimeout(() => {
                done();
              }, networkTimeout);
            }, networkTimeout * 2);
          }

          if (run === 2) {
            if (renderCount === 1) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: true,
                  data: {
                    books: [1, 42, 150],
                  },
                  error: null,
                  failed: false,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            }
            if (renderCount === 2) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: false,
                  data: {
                    books: [1, 42, 150],
                  },
                  failed: true,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            }

            // This is the 2nd doFetch(). It is difficult to update
            // the `run` for that fetch, so we just use the renderCounts.
            else if (renderCount === 3) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: true,
                  data: {
                    books: [1, 42, 150],
                  },
                  error: null,
                  failed: false,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            } else if (renderCount === 4) {
              expect(options).toEqual(
                expect.objectContaining({
                  fetching: false,
                  data: {
                    authors: [22, 13],
                  },
                  error: null,
                  failed: false,
                  requestKey: 'sandwiches',
                  requestName: 'anonymousRequest',
                  url: '/test/succeeds/json-two',
                })
              );
            }
            if (renderCount > 4) {
              done.fail();
            }
          }
        }}
      </Fetch>
    );

    setTimeout(() => {
      // NOTE: this is for adding stuff to the cache.
      // This DOES NOT test the cache-only behavior!
      expect(fetchMock.calls('/test/succeeds/json-one').length).toBe(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/json-one',
          error: null,
          failed: false,
          didUnmount: false,
          data: {
            books: [1, 42, 150],
          },
        })
      );
      expect(onResponseMock).toHaveBeenCalledTimes(1);
      expect(onResponseMock).toBeCalledWith(
        null,
        expect.objectContaining({
          ok: true,
          status: 200,
          statusText: 'OK',
          data: {
            books: [1, 42, 150],
          },
        })
      );
    }, networkTimeout);
  });
});
