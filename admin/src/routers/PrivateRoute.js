import React from 'react';
import { Redirect, Route } from 'react-router-dom';
// import matchPropTypes from "./matchPropTypes";

/**
 * If we have a logged-in user, display the component, otherwise redirect to login page.
 */
const PrivateRoute = ({ component: Component, user, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
     <Component user={user} {...props} />}
  />
);

//  PrivateRoute.propTypes = matchPropTypes;

export default PrivateRoute;