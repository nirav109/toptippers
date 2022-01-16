/** User Reducers  */

import { userActionTypes } from './../constants/apiConstants';

const initialState = {
    userData: [],
    userDetails: '',
    totalCount: 0
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case userActionTypes.get_users.SUCCESS:
            return {
                ...state,
                userData: payload.userData,
                totalCount: payload.totalCount
            };
        case userActionTypes.get_userDetails.SUCCESS:
            return {
                ...state,
                userDetails: payload.userDetails
            };
        default:
            return state;
    }
};