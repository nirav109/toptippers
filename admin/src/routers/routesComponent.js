import React, { Component } from 'react';
import Login from '../modules/login/Login';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import { Switch } from "react-router-dom";
import Dashboard from '../modules/admin/dashboard/Dashboard';
import Base from '../components/Base';
// import SignUp from '../modules/signup/Signup';
import Users from '../modules/user/User';
import UserProfile from '../modules/user/userProfile';
import WrappedForgotPasswordForm from '../components/ForgotPassword';
import WrappedResetPasswordForm from '../components/resetPassword';
import Sport from '../modules/master/sport/sport';
import Bonus from '../modules/master/bonus/bonus';
import Round from '../modules/master/round/round';
import Game from '../modules/master/game/game';
import Comp from '../modules/master/comp/comp';

import Team from '../modules/master/team/team';
import TeamDetail from '../modules/master/team/teamDetail';
import Topic from '../modules/cms/topic/topic';
import Question from '../modules/cms/question/question';
import Content from '../modules/cms/content/content';
import { connect } from 'react-redux';
import history from '../history';
import adreport from '../modules/Ad/adreport/adreport';
import Messaging from '../modules/messaging/Messaging';
import ad from '../modules/Ad/ad/ad';
import season from '../modules/master/season/season';
import seasonDetail from '../modules/master/season/seasonDetail';


class RoutesComponent extends Component {

    render() {
        let props = this.props;
        let split = props.location.pathname.split('/')
        let value = split[2];
        const listofPages = [
            '/',
            '/signin',
            '/signup',
            '/forgot',
            '/resetPassword/' + value,
            '/verifyEmail/' + value,
            '/test'
        ];

        const token = localStorage.access_token ? true : false;

        if (listofPages.indexOf(props.location.pathname) > -1) {

            return (
                <Switch>
                    <PublicRoute exact path="/" component={Login} />
                    <PublicRoute path="/forgot" component={WrappedForgotPasswordForm} />
                    <PublicRoute path="/resetPassword/:resetKey" component={WrappedResetPasswordForm} />
                    {/* <PublicRoute exact path="/signup" component={SignUp} /> */}
                </Switch>);
        } else {
            return (
                <Base user={props.userInfo}>
                    <Switch>
                        <PrivateRoute path="/dashboard" component={Dashboard}  />
                        <PrivateRoute path="/users" component={Users}  />
                        <PrivateRoute path="/userprofile/:userId" component={UserProfile}  />
                        <PrivateRoute path="/season" component={season}  />
                        <PrivateRoute path="/seasondetail/:seasonId" component={seasonDetail}  />
                        <PrivateRoute path="/sport" component={Sport}  />
                        <PrivateRoute path="/team" component={Team}  />
                        <PrivateRoute path="/teamdetail/:teamId" component={TeamDetail}  />
                        <PrivateRoute path="/bonus" component={Bonus}  />
                        <PrivateRoute path="/round" component={Round}  />
                        <PrivateRoute path="/game" component={Game}  />
                        <PrivateRoute path="/competition" component={Comp}  />
                        <PrivateRoute path="/topics" component={Topic}  />
                        <PrivateRoute path="/questions" component={Question}  />
                        <PrivateRoute path="/content" component={Content}  />
                        <PrivateRoute path="/adreport" component={adreport}  />
                        <PrivateRoute path="/messaging" component={Messaging}  />
                        <PrivateRoute path="/ads" component={ad}  />

                    </Switch>
                </Base>
            );
        }
    }
}
function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(RoutesComponent);
