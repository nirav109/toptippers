/*
 * filename: routers.js
 * mainly responsivle for all routes component
 *
 * */

import React, { Component } from 'react';
import history from '../history';
import { Route } from 'react-router-dom';
import { Router } from 'react-router';
import RoutesComponent from './routesComponent.js';

class Routers extends Component {
  render() {
    return (
      <Router history={history}>
        <Route component={RoutesComponent} />
      </Router>
    );
  }
}

export default Routers;
