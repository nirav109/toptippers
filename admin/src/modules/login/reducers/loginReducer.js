/*
     Login Reducers 
*/
import { loginActionTypes } from './../constants/apiConstants';

const initialState = {
    access_token: null,
    authData: '',

};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case loginActionTypes.post_login.SUCCESS:
            return {
                ...state,
                access_token: payload.access_token,
                authData: payload.authData
            };
        default:
            return state;
    }
};