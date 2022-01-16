/** User Actions  */
import {
    actionCreator,
    userActionTypes,
    jsonApiHeader,
} from './../constants/apiConstants';

import { loginActionTypes } from './../../login/constants/apiConstants';
import { API_URL } from '../../../actions/utilAction';
import axios from 'axios';
import * as constant from '../../../actions/constant';
import toastr from 'toastr';
let access_token = localStorage.access_token;

export function getUsers(values) {
    return (dispatch) => {
        // console.log("here--------------")
        axios.post(API_URL + constant.USER_LIST, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    // console.log("response",response)
                    dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                }
            });
    };
}

export function getAllUsers(values) {
    return (dispatch) => {
        // console.log("here--------------")
        axios.post(API_URL + constant.ALL_USER_LIST, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    // console.log("response",response)
                    dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                }
            });
    };
}

export function deleteUser(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.USER_DELETE, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                let userObj = {
                    page: 0
                }
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.USER_LIST, userObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                            }
                        });
                }
            });
    };
}

export function deleteUsers(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.USERS_DELETE, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                let userObj = {
                    page: 0
                }
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.ALL_USER_LIST, userObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                            }
                        });
                }
            });
    };
}

export function verifyUser(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.USER_VERIFY, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                let userObj = {
                    page: 0
                }
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.USER_LIST, userObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                            }
                        });
                }
            });
    };
}

export function deActivateUser(values) {

    return (dispatch) => {
        axios.post(API_URL + constant.DEACTIVATE_USER, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        }
        ).then(function (response) {
            if (response.data.code === 200) {
                axios.post(API_URL + constant.USER_LIST, values, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data }));
                        }
                    });
                toastr.success(response.data.message)
            } else {
                toastr.error(response.data.message)
            }
        });
    };
}

export function getUserDetails(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.USER_DETAILS, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(userActionTypes.get_userDetails.SUCCESS, { userDetails: response.data.data }));
                }
            });
    };
}

export function updateProfile(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.USER_UPDATE, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.USER_DETAILS, {userId: obj.userId}, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(userActionTypes.get_userDetails.SUCCESS, { userDetails: response.data.data }));
                            }
                        });
                }
            });
    };
    
}

export function updateProfilePic(formadata, userId) {
    return (dispatch) => {
        axios.post(API_URL + constant.PROFILE_PIC_UPDATE, formadata, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.USER_DETAILS, {userId: userId}, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(userActionTypes.get_userDetails.SUCCESS, { userDetails: response.data.data }));
                            }
                        });
                }
            });
    };
}

export function addUser(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_USER, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let userObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.USER_LIST, userObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            // console.log("response",response)
                            dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function sendMessage(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.SEND_MESSAGE, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let userObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.ALL_USER_LIST, userObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            // console.log("response",response)
                            dispatch(actionCreator(userActionTypes.get_users.SUCCESS, { userData: response.data.data, totalCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}
