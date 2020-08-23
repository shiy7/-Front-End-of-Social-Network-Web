import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
// A <Router> that uses the HTML5 history API (pushState, replaceState and the popstate event)
// to keep your UI in sync with the URL.
import { BrowserRouter } from "react-router-dom";


// react router: to implement SPA (single page application)
// SPA:
// 1. single page -> upp
// 2. click link ->
// 3. router ->
// In SPA, how to transfer between different pages? --> router
// router 本质: a pair of key-value (key: url,purl, value: component)
// router (back-end, front-end)
// font-end router 本质: 使 url 和 UI 之间的同步


ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
