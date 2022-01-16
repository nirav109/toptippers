/*
     Login Api Constants
*/
import {
    actionCreator,
    createRequestActionTypes,
    jsonApiHeader
} from './../../../actions/utilAction';
export {
    actionCreator,
    jsonApiHeader
};

export const loginActionTypes = {
    post_login: createRequestActionTypes('POST_LOGIN'),
};