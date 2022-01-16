const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

// Local
// export const BASE_URL = 'http://localhost:3019/';


export const API_URL = BASE_URL + 'api/'
export const PROFILE_IMG_PATH = BASE_URL + 'app/uploads/profile/';
export const LOGO_IMG_PATH = BASE_URL + 'app/uploads/teamlogo/';


export function actionCreator(actionType, data) {
    return {
        type: actionType,
        payload: data,
    };
}

export function createRequestActionTypes(base) {
    return [REQUEST, SUCCESS, FAILURE].reduce((requestTypes, type) => {
        requestTypes[type] = `${base}_${type}`;
        return requestTypes;
    }, {});
}

export const jsonApiHeader = (accessToken, ContentType) => {
    return {
        "Content-Type": ContentType,
        Authorization: localStorage.access_token ?
            `${localStorage.access_token}` : "",
    };
};