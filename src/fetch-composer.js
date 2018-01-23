import React from 'react';
import PropTypes from 'prop-types';
import Composer from 'react-composer';

export default function FetchComposer({ requests = [], render }) {
  return <Composer components={requests} render={render} />;
}

FetchComposer.propTypes = {
  render: PropTypes.func,
  requests: PropTypes.array
};
