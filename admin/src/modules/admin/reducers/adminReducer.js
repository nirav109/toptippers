/** Admin Reducers  */

import { adminActionTypes } from "./../constants/apiConstants";

const initialState = {
  sportData: [],
  sportCount: 0,
  dashboardCounts: "",
  graphStats: [],
  teamData: [],
  teamCount: 0,
  teamDetails: "",
  bonusData: [],
  bonusCount: 0,
  roundData: [],
  roundCount: 0,
  gameData: [],
  gameCount: 0,
  topicData: [],
  topicCount: 0,
  questionData: [],
  questionCount: 0,
  contentData: [],
  contentCount: 0,
  userData: [],
  userCount: 0,
  competitionData: [],
  competitionCount: 0,
  settingData: {},
  adreportData: [],
  adreportCount: 0,
  seasonData: [],
  seasonCount: 0,
  seasonDetails: "",
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case adminActionTypes.get_sport.SUCCESS:
      return {
        ...state,
        sportData: payload.sportData,
        sportCount: payload.sportCount,
      };
    case adminActionTypes.admin_counts.SUCCESS:
      return {
        ...state,
        dashboardCounts: payload.dashboardCounts,
      };
    case adminActionTypes.get_team.SUCCESS:
      return {
        ...state,
        teamData: payload.teamData,
        teamCount: payload.teamCount,
      };
    case adminActionTypes.get_teamDetails.SUCCESS:
      return {
        ...state,
        teamDetails: payload.teamDetails,
      };
    case adminActionTypes.get_bonus.SUCCESS:
      return {
        ...state,
        bonusData: payload.bonusData,
        bonusCount: payload.bonusCount,
      };
    case adminActionTypes.get_round.SUCCESS:
      return {
        ...state,
        roundData: payload.roundData,
        roundCount: payload.roundCount,
      };
    case adminActionTypes.get_game.SUCCESS:
      return {
        ...state,
        gameData: payload.gameData,
        gameCount: payload.gameCount,
      };
    case adminActionTypes.get_topic.SUCCESS:
      return {
        ...state,
        topicData: payload.topicData,
        topicCount: payload.topicCount,
      };
    case adminActionTypes.get_question.SUCCESS:
      return {
        ...state,
        questionData: payload.questionData,
        questionCount: payload.questionCount,
      };
    case adminActionTypes.get_content.SUCCESS:
      return {
        ...state,
        contentData: payload.contentData,
        contentCount: payload.contentCount,
      };
    case adminActionTypes.get_competition.SUCCESS:
      return {
        ...state,
        competitionData: payload.competitionData,
        competitionCount: payload.competitionCount,
      };
    case adminActionTypes.get_user.SUCCESS:
      return {
        ...state,
        userData: payload.userData,
        userCount: payload.userCount,
      };
    case adminActionTypes.get_setting.SUCCESS:
      return {
        ...state,
        settingData: payload.settingData,
      };
    case adminActionTypes.get_adreport.SUCCESS:
      return {
        ...state,
        adreportData: payload.adreportData,
        adreportCount: payload.adreportCount,
      };
    case adminActionTypes.get_ad.SUCCESS:
      return {
        ...state,
        adData: payload.adData,
        adCount: payload.adCount,
      };
    case adminActionTypes.get_comp.SUCCESS:
      return {
        ...state,
        compData: payload.compData,
        compCount: payload.compCount,
      };
    case adminActionTypes.get_season.SUCCESS:
      return {
        ...state,
        seasonData: payload.seasonData,
        seasonCount: payload.seasonCount
      };
    case adminActionTypes.get_seasonDetails.SUCCESS:
      return {
        ...state,
        seasonDetails: payload.seasonDetails,
      };
    default:
      return state;
  }
};
