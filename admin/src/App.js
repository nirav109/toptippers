import React from 'react';
import './App.css';
import './static/css/style.css';
import 'antd/dist/antd.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'toastr/build/toastr.min.css';
import Routers from './routers/routers.js';

function App() {
  return (<Routers/>);
}

export default App;
