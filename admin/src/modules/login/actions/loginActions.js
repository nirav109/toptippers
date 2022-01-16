/** Login Actions  */

import {
    actionCreator,
    loginActionTypes,
    jsonApiHeader
} from './../constants/apiConstants';
import history from '../../../history.js';
import { API_URL } from '../../../actions/utilAction';
import axios from 'axios';
import toastr from 'toastr';
import * as constant from '../../../actions/constant';

let access_token = localStorage.access_token;

export function loginAction(authObj) {

    return (dispatch) => {
        // history.push(constant.DASHBOARD);
        axios.post(API_URL + constant.USER_LOGIN, authObj, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(function(response) {
            console.log("LOGIN_RES", response);
            if (response.data.code === 200) {
                dispatch(actionCreator(loginActionTypes.post_login.SUCCESS, { errorMessage: null, access_token: response.data.data.token, authData: response.data.data }));
                localStorage.setItem('access_token', response.data.data.token);
                history.push(constant.DASHBOARD);
                toastr.success(response.data.message)
            } else {
                toastr.error(response.data.message)
            }
        }).catch(error => {
            console.log("LOGINRES", error)
        })
    };
}

export function forgotPassword(authObj) {

    return (dispatch) => {
        axios.post(API_URL + constant.FORGOT_PASSWORD, authObj, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(function(response) {
                if (response.data.code === 200) {
                    history.push(constant.LOGIN);
                    toastr.success(response.data.message)
                } else {
                    toastr.error(response.data.message)
                }
            });
    };
}

export function resetPassword(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.RESET_PASSWORD, obj, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(function(response) {
                if (response.data.code === 200) {
                    history.push(constant.LOGIN);
                    toastr.success(response.data.message)
                } else {
                    toastr.error(response.data.message)
                }
            });
    };
}