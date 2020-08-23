import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Register  from './Register';
import Login from "./Login"
import Home from './Home';

class Main extends React.Component {
    getLogin = () => {
        // case 1: already login --> <Home></Home>
        // case 2: not yet --> <log />
        return this.props.isLoggedIn ?
            <Redirect to="/home"/>
            : <Login handleLoginSucceed={this.props.handleLoginSucceed}/>;
    }


    getHome = () => {
        // case 1: already login --> <Home />
        // case 2: not yet --> <log />
        return this.props.isLoggedIn ?
            <Home/> : <Redirect to="/login"/>;
    }


    render() {
        return (
            <div className="main">
                <Switch>
                    {/*
                    Route: The Route component is perhaps the most important component in React Router
                     to understand and learn to use well. Its most basic responsibility is to render some UI
                     when a location matches the route’s path.

                     Switch: Renders the first child <Route> or <Redirect> that matches the location.

                     render: 动态
                     component：静态
                     */}
                    <Route path="/login" render={this.getLogin}/>
                    <Route path="/register" component={Register}/>
                    <Route path="/home" render={this.getHome}/>
                    {/*
                    default address to login
                    when the address is wrong, it direct to login
                    */}
                    <Route render={this.getLogin}/>

                </Switch>
            </div>
        );
    }
}

export default Main;