/** User Api Constants */
     
import {
    actionCreator,
    createRequestActionTypes,
    jsonApiHeader,
} from './../../../actions/utilAction';
export {
    actionCreator,
    jsonApiHeader
};

export const userActionTypes = {
    get_users: createRequestActionTypes('GET_USER'),
    get_userDetails: createRequestActionTypes('GET_USER_DETAILS'),

};
