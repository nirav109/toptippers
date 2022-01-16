import React from 'react';
import { Redirect, Route } from 'react-router-dom';
// import matchPropTypes from "./matchPropTypes";

/**
 * If we have a logged-in user, redirect to the home page. Otherwise, display the component.
 */
const PublicRoute = ({ component: Component, user, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      user
        ? <Redirect to={{ pathname: '/' }} />
        : <Component user={user} {...props} />}
  />
);

// PublicRoute.propTypes = matchPropTypes;

export default PublicRoute;
