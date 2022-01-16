/** Admin Api Constants */

import {
    actionCreator,
    createRequestActionTypes,
    jsonApiHeader,
} from './../../../actions/utilAction';
export {
    actionCreator,
    jsonApiHeader
};

export const adminActionTypes = {
    get_sport: createRequestActionTypes('GET_SPORT'),
    admin_counts: createRequestActionTypes('GET_ADMIN_COUNT'),
    get_team: createRequestActionTypes('GET_TEAM'),
    get_teamDetails: createRequestActionTypes('GET_TEAM_DETAIL'),
    get_bonus: createRequestActionTypes('GET_BONUS'),
    get_round: createRequestActionTypes('GET_ROUND'),
    get_game: createRequestActionTypes('GET_GAME'),
    get_topic: createRequestActionTypes('GET_TOPIC'),
    get_question: createRequestActionTypes('GET_QUESTION'),
    get_content: createRequestActionTypes('GET_CONTENT'),
    get_competition: createRequestActionTypes('GET_COMPETITION'),
    get_user: createRequestActionTypes('GET_USER'),
    get_setting: createRequestActionTypes('GET_SETTING'),
    get_adreport: createRequestActionTypes('GET_ADREPORT'),
    get_ad: createRequestActionTypes('GET_AD'),
    get_comp: createRequestActionTypes('GET_COMP'),
    get_season: createRequestActionTypes('GET_SEASON'),
    get_seasonDetails: createRequestActionTypes('GET_SEASON_DETAIL')
};