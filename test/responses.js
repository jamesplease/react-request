export function successfulResponse() {
  return new Response('hi', {
    status: 200,
    statusText: 'OK'
  });
}

export function jsonResponse() {
  return new Response('{"books": [1, 42, 150]}', {
    status: 200,
    statusText: 'OK'
  });
}
