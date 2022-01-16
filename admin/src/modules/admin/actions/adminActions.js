/** Admin Actions  */

import {
    actionCreator,
    adminActionTypes,
    jsonApiHeader
} from './../constants/apiConstants';
import { API_URL } from '../../../actions/utilAction';
import axios from 'axios';
import * as constant from '../../../actions/constant';
import toastr from 'toastr';

let access_token = localStorage.access_token;


export function getSport(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.SPORT_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_sport.SUCCESS, { sportData: response.data.data, sportCount: response.data.totalCount }));
                }
            });
    };
}

export function addSport(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_SPORT, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0
                }
                console.log("response isssssss", response);
                toastr.success(response.data.message)
                axios.post(API_URL + constant.SPORT_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_sport.SUCCESS, { sportData: response.data.data, sportCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                console.log("response isssssss", response);
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeSport(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_SPORT, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let sportObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.SPORT_LIST, sportObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_sport.SUCCESS, { sportData: response.data.data, sportCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function resetGamePoints(obj) {

    return (dispatch) => {
        axios.get(API_URL + constant.RESET_GAME_POINTS, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)

                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function getTeam(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.TEAM_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_team.SUCCESS, { teamData: response.data.data, teamCount: response.data.totalCount }));
                }
            });
    };
}


export function getTeamDetails(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.TEAM_DETAIL, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    // console.log("response.data",response.data)
                    dispatch(actionCreator(adminActionTypes.get_teamDetails.SUCCESS, { teamDetails: response.data.data }));
                }
            });
    };
}

export function addTeam(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_TEAM, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let teamObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.TEAM_LIST, teamObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_team.SUCCESS, { teamData: response.data.data, teamCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeTeam(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_TEAM, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let teamObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.TEAM_LIST, teamObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_team.SUCCESS, { teamData: response.data.data, teamCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function updateTeam(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.TEAM_UPDATE, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.TEAM_DETAIL, { teamId: obj.teamId }, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_teamDetails.SUCCESS, { teamDetails: response.data.data }));
                            }
                        });
                }
            });
    };

}

export function updateTeamLogo(formadata) {
    return (dispatch) => {
        axios.post(API_URL + constant.UPDATE_LOGO, formadata, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    // console.log("response.data.",response.data)
                    axios.post(API_URL + constant.TEAM_DETAIL, { teamId: response.data.data._id }, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_teamDetails.SUCCESS, { teamDetails: response.data.data }));
                            }
                        });
                }
            });
    };
}

export function blockTeam(values) {
    return (dispatch) => {
        axios.post(API_URL + constant.BLOCK_TEAM, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                axios.post(API_URL + constant.TEAM_LIST, values, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_team.SUCCESS, { teamData: response.data.data, teamCount: response.data.totalCount }));
                        }
                    });
                toastr.success(response.data.message)
            } else {
                toastr.error(response.data.message)
            }
        });
    };
}


export function getBonus(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.BONUS_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    console.log("response-------", response.data)
                    dispatch(actionCreator(adminActionTypes.get_bonus.SUCCESS, { bonusData: response.data.data, bonusCount: response.data.totalCount }));
                }
            });
    };
}

export function addBonus(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_BONUS, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.BONUS_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_bonus.SUCCESS, { bonusData: response.data.data, bonusCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeBonus(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_BONUS, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let bonusObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.BONUS_LIST, bonusObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_bonus.SUCCESS, { bonusData: response.data.data, bonusCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function getRound(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.ROUND_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_round.SUCCESS, { roundData: response.data.data, roundCount: response.data.totalCount }));
                }
            });
    };
}

export function addRound(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_ROUND, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.ROUND_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_round.SUCCESS, { roundData: response.data.data, roundCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201 || response.data.code === 400 || response.data.code == 409) {
                toastr.warning(response.data.message)
            }
        });
    };
}


export function blockRound(values) {
    return (dispatch) => {
        axios.post(API_URL + constant.BLOCK_ROUND, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                axios.post(API_URL + constant.ROUND_LIST, values, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_round.SUCCESS, { roundData: response.data.data, roundCount: response.data.totalCount }));
                        }
                    });
                toastr.success(response.data.message)
            } else {
                toastr.error(response.data.message)
            }
        });
    };
}

export function removeRound(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_ROUND, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let sportObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.ROUND_LIST, sportObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_round.SUCCESS, { roundData: response.data.data, roundCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function updateRound(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.UPDATE_ROUND, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.ROUND_LIST, { teamId: obj.teamId }, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_round.SUCCESS, { roundData: response.data.data, roundCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };

}


export function getGame(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.GAME_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_game.SUCCESS, { gameData: response.data.data, gameCount: response.data.totalCount }));
                }
            });
    };
}

export function autoTipping() {

    return (dispatch) => {
        axios.get(API_URL + constant.AUTO_TIPPING, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                }
            });
    };
}

export function sendGameStartNotification(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.GAME_START_NOTIFICATION, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                }
                console.log("dat", response);
            });
    };
}


export function addGame(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_GAME, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0,
                    season: authObj.selectedSeason
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.GAME_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_game.SUCCESS, { gameData: response.data.data, gameCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeGame(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_GAME, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let sportObj = {
                        page: 0,
                        season: obj.selectedSeason
                    }
                    axios.post(API_URL + constant.GAME_LIST, sportObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_game.SUCCESS, { gameData: response.data.data, gameCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function updateGame(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.UPDATE_GAME, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.GAME_LIST, { teamId: obj.teamId, season: obj.selectedSeason }, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_game.SUCCESS, { gameData: response.data.data, gameCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };

}

export function updateGameSeason(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.UPDATE_GAME_SEASON, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {

                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    axios.post(API_URL + constant.GAME_LIST, { season: obj.selectedSeason }, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_game.SUCCESS, { gameData: response.data.data, gameCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };

}


export function getTopic(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.TOPIC_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_topic.SUCCESS, { topicData: response.data.data, topicCount: response.data.totalCount }));
                }
            });
    };
}

export function addTopic(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_TOPIC, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let topicObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.TOPIC_LIST, topicObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_topic.SUCCESS, { topicData: response.data.data, topicCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeTopic(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_TOPIC, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let topicObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.TOPIC_LIST, topicObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_topic.SUCCESS, { topicData: response.data.data, topicCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function getQuestion(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.QUESTION_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_question.SUCCESS, { questionData: response.data.data, questionCount: response.data.totalCount }));
                }
            });
    };
}

export function addQuestion(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_QUESTION, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let questionObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.QUESTION_LIST, questionObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_question.SUCCESS, { questionData: response.data.data, questionCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeQuestion(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_QUESTION, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let topicObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.QUESTION_LIST, topicObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_question.SUCCESS, { questionData: response.data.data, questionCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function getContent(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.CONTENT_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_content.SUCCESS, { contentData: response.data.data, contentCount: response.data.totalCount }));
                }
            });
    };
}

export function addContent(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_CONTENT, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let topicObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.CONTENT_LIST, topicObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_content.SUCCESS, { contentData: response.data.data, contentCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function getCompetitions(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.COMPETITION_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_competition.SUCCESS, { competitionData: response.data.data, competitionCount: response.data.totalCount }));
                }
            });
    };
}

export function getUsers(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.USER_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_user.SUCCESS, { userData: response.data.data, userCount: response.data.totalCount }));
                }
            });
    };
}

export function addSetting(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_SETTING, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let topicObj = {
                    type: "testing"
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.GET_SETTING, topicObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_setting.SUCCESS, { settingData: response.data.data }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function getSetting(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.GET_SETTING, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_setting.SUCCESS, { settingData: response.data.data }));
                }
            });
    };
}

export function clearSession() {

    return (dispatch) => {
        axios.post(API_URL + constant.CLEAR_SESSION, {}, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    console.log("clearSession Response ", response);
                    toastr.success(response.data.message);
                    dispatch(actionCreator(adminActionTypes.get_setting.SUCCESS, { settingData: response.data.data }));
                }
            });
    };
}

export function getAdReports(values) {
    return (dispatch) => {
        // console.log("here--------------")
        axios.post(API_URL + constant.AD_REPORTS, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    // console.log("response",response)
                    dispatch(actionCreator(adminActionTypes.get_adreport.SUCCESS, { adreportData: response.data.data, adreportCount: response.data.totalCount }));
                }
            });
    };
}


export function getAd(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.AD_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_ad.SUCCESS, { adData: response.data.data, adCount: response.data.totalCount }));
                }
            });
    };
}

export function addAd(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_AD, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.AD_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_ad.SUCCESS, { adData: response.data.data, adCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}

export function removeAd(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_AD, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let sportObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.AD_LIST, sportObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_ad.SUCCESS, { adData: response.data.data, adCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function getComp(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.COMP_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_comp.SUCCESS, { compData: response.data.data, compCount: response.data.totalCount }));
                }
            });
    };
}

export function resetCompUserGamePoints(obj) {

    return (dispatch) => {
        axios.get(API_URL + constant.RESET_COMP_USER_GAME_POINTS, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)

                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function resetAllCompUserGamePoints(obj) {

    return (dispatch) => {
        axios.get(API_URL + constant.RESET_ALL_COMP_USER_GAME_POINTS, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)

                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function removeComp(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_COMP, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.success(response.data.message)
                    let compObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.COMP_LIST, compObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    })
                        .then(function (response) {
                            if (response.data.code === 200) {
                                dispatch(actionCreator(adminActionTypes.get_comp.SUCCESS, { compData: response.data.data, compCount: response.data.totalCount }));
                            }
                        });
                } else if (response.data.code === 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}

export function getSeason(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.SEASON_LIST, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    dispatch(actionCreator(adminActionTypes.get_season.SUCCESS, { seasonData: response.data.data, seasonCount: response.data.totalCount }));
                }
            });
    };
}


export function addSeason(authObj) {
    return (dispatch) => {
        axios.post(API_URL + constant.ADD_SEASON, authObj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                let sportObj = {
                    page: 0
                }
                toastr.success(response.data.message)
                axios.post(API_URL + constant.SEASON_LIST, sportObj, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_season.SUCCESS, { seasonData: response.data.data, seasonCount: response.data.totalCount }));
                        }
                    });
            } else if (response.data.code === 201 || response.data.code === 400 || response.data.code == 409) {
                toastr.error(response.data.message)
            }
        });
    };
}

export function removeSeason(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.REMOVE_SEAON, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    toastr.warning(response.data.message)
                    let seasonObj = {
                        page: 0
                    }
                    axios.post(API_URL + constant.SEASON_LIST, seasonObj, {
                        headers: jsonApiHeader(access_token, 'application/json')
                    }).then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_season.SUCCESS, { seasonData: response.data.data, seasonCount: response.data.totalCount }))
                        }
                    });
                } else if (response.data.code == 201) {
                    toastr.warning(response.data.message)
                }
            });
    };
}


export function getSportSeason(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.FILTER_SPORT, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                toastr.success(response.data.message)
                let sportObj = {
                    page: 0
                }
                // console.log("response issssss", response);

                dispatch(actionCreator(adminActionTypes.get_sport.SUCCESS, { sportData: response.data.data, sportCount: response.data.totalCount }));

            } else if (response.data.code == 201) {
                toastr.warning(response.data.message)
            }
        });
    };
}



export function getTeamBySportId(obj) {
    return (dispatch) => {
        axios.post(API_URL + constant.TEAM_LIST_BY_SPORTID, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                toastr.success(response.data.message)

                console.log("response issssss", response);
                dispatch(actionCreator(adminActionTypes.get_team.SUCCESS, { teamData: response.data.data, teamCount: response.data.totalCount }));

            } else if (response.data.code == 201) {
                toastr.waarning(response.data.message)
            }
        });
    };
}

export function blockSeason(values) {
    return (dispatch) => {
        axios.post(API_URL + constant.BLOCK_SEASON, values, {
            headers: jsonApiHeader(access_token, 'application/json')
        }).then(function (response) {
            if (response.data.code === 200) {
                axios.post(API_URL + constant.SEASON_LIST, values, {
                    headers: jsonApiHeader(access_token, 'application/json')
                })
                    .then(function (response) {
                        if (response.data.code === 200) {
                            dispatch(actionCreator(adminActionTypes.get_season.SUCCESS, { seasonData: response.data.data, seasonCount: response.data.totalCount }));
                        }
                    });
                toastr.success(response.data.message)
            } else {
                toastr.error(response.data.message)
            }
        });
    };
}


export function getSeasonDetails(obj) {

    return (dispatch) => {
        axios.post(API_URL + constant.SEASON_DETAIL, obj, {
            headers: jsonApiHeader(access_token, 'application/json')
        })
            .then(function (response) {
                if (response.data.code === 200) {
                    // console.log("response.data",response.data)
                    dispatch(actionCreator(adminActionTypes.get_seasonDetails.SUCCESS, { seasonDetails: response.data.data }));
                }
            });
    };
}