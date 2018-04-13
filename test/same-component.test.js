import React from 'react';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import { Fetch, clearRequestCache, clearResponseCache } from '../src';
import { jsonResponse, jsonResponse2 } from './responses';
import { setTimeout } from 'timers';

fetchMock.get(
  '/test/succeeds/json-one',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse());
    })
);

fetchMock.get(
  '/test/succeeds/json-two',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse2());
    })
);

// Some time for the mock fetches to resolve
const networkTimeout = 10;

beforeEach(() => {
  clearRequestCache();
  clearResponseCache();
});

describe('same-component subsequent requests with caching (gh-151)', () => {
  // Issue 151 describes the 3 situations when requests can be made. "Prop changes"
  // refers to situation 2.
  describe('prop changes', () => {
    test('it uses a directly-updated request key on subsequent renders', done => {
      // expect.assertions(8);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      let secondRun = false;
      let secondRenderCount = 0;

      const wrapper = mount(
        <Fetch
          url="/test/succeeds/json-one"
          requestKey="1"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}>
          {options => {
            if (secondRun) {
              // Increment our render count. This allows us to
              // test for each of the individual renders involved
              // with changing the prop.
              secondRenderCount++;

              // This first render is interesting: we basically only have a
              // new URL set, but the request has not yet begun. The reason
              // for this is because we do the fetch in `componentDidUpdate`.
              if (secondRenderCount === 1) {
                expect(options).toEqual(
                  expect.objectContaining({
                    requestKey: '1',
                    fetching: false,
                    data: {
                      books: [1, 42, 150]
                    },
                    error: null,
                    failed: false,
                    url: '/test/succeeds/json-two'
                  })
                );
              } else if (secondRenderCount === 2) {
                expect(options).toEqual(
                  expect.objectContaining({
                    requestKey: '2',
                    fetching: true,
                    data: {
                      books: [1, 42, 150]
                    },
                    error: null,
                    failed: false,
                    url: '/test/succeeds/json-two'
                  })
                );
              } else if (secondRenderCount === 3) {
                expect(options).toEqual(
                  expect.objectContaining({
                    requestKey: '2',
                    fetching: false,
                    data: {
                      authors: [22, 13]
                    },
                    error: null,
                    failed: false,
                    url: '/test/succeeds/json-two'
                  })
                );
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
              books: [1, 42, 150]
            }
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
              books: [1, 42, 150]
            }
          })
        );

        secondRun = true;
        wrapper.setProps({
          url: '/test/succeeds/json-two',
          requestKey: '2'
        });

        // We do a network timeout here to ensure that the `expect` within
        // render is called a second time.
        setTimeout(() => {
          done();
        }, networkTimeout);
      }, networkTimeout);
    });

    // test('it uses an indirectly-updated request key on subsequent renders', done => {
    //   // expect.assertions(10);
    //   const onResponseMock = jest.fn();
    //   const beforeFetchMock = jest.fn();
    //   const afterFetchMock = jest.fn();

    //   let run = 1;

    //   const wrapper = mount(
    //     <Fetch
    //       url="/test/succeeds/json-one"
    //       beforeFetch={beforeFetchMock}
    //       afterFetch={afterFetchMock}
    //       onResponse={onResponseMock}>
    //       {options => {
    //         if (run === 1 && options.response) {
    //           expect(options.data).toEqual({
    //             books: [1, 42, 150]
    //           });
    //         }
    //         if (run === 2 && options.fetching) {
    //           expect(options.data).toEqual({
    //             books: [1, 42, 150]
    //           });
    //         }

    //         if (run === 2 && !options.fetching) {
    //           expect(options.data).toEqual({
    //             authors: [22, 13]
    //           });
    //         }

    //         // With data from the cache, there is no in-between render
    //         // for "loading." It just immediately gets set.
    //         if (run === 3) {
    //           expect(options.data).toEqual({
    //             books: [1, 42, 150]
    //           });
    //         }
    //       }}
    //     </Fetch>
    //   );

    //   setTimeout(() => {
    //     // NOTE: this is for adding stuff to the cache.
    //     // This DOES NOT test the cache-only behavior!
    //     expect(fetchMock.calls('/test/succeeds/json-one').length).toBe(1);
    //     expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    //     expect(afterFetchMock).toHaveBeenCalledTimes(1);
    //     expect(afterFetchMock).toBeCalledWith(
    //       expect.objectContaining({
    //         url: '/test/succeeds/json-one',
    //         error: null,
    //         failed: false,
    //         didUnmount: false,
    //         data: {
    //           books: [1, 42, 150]
    //         }
    //       })
    //     );
    //     expect(onResponseMock).toHaveBeenCalledTimes(1);
    //     expect(onResponseMock).toBeCalledWith(
    //       null,
    //       expect.objectContaining({
    //         ok: true,
    //         status: 200,
    //         statusText: 'OK',
    //         data: {
    //           books: [1, 42, 150]
    //         }
    //       })
    //     );

    //     run = 2;
    //     wrapper.setProps({
    //       url: '/test/succeeds/json-two'
    //     });

    //     setTimeout(() => {
    //       run = 3;
    //       wrapper.setProps({
    //         url: '/test/succeeds/json-one'
    //       });

    //       setTimeout(() => {
    //         done();
    //       }, 500);
    //     }, 500);
    //   }, networkTimeout);
    // });
  });

  describe('doFetch', () => {});
});
