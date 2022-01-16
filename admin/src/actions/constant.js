/** MESSAGE CONSTANT */
export const DELETE_RECORD = 'Do you want to delete this record?';
export const VERIFY_RECORD = 'Do you want to verified this account?';
export const DELETE_RECORD_SUCCESS = 'Record deleted successfully';
export const ALREADY_EXIST = 'Data already exist';

/** API CONSTANT */
export const USER_LOGIN = 'f/user/userAdminLogin';
export const USER_REGISTER = 'f/user/register';
export const USER_LIST = 'user/listUser';
export const ALL_USER_LIST = 'user/listAllUser';
export const SPORT_LIST = 'sport/listSport';
export const COMP_LIST = 'competition/listCompetition';
export const REMOVE_COMP = 'competition/deleteCompetition';

export const SEASON_LIST = "season/getSeasonList"
export const ADD_SEASON = "season/addSeason";
export const REMOVE_SEAON = "season/deleteSeason";
export const BLOCK_SEASON = "season/blockSeason"
export const SEASON_DETAIL = "season/getTeamDetail";

export const FILTER_SPORT = "sport/Filter";

export const ADD_SPORT = 'sport/addupdateSport';
export const DEACTIVATE_USER = 'user/deActivateUser';
export const REMOVE_SPORT = 'sport/deleteSport';
export const TEAM_LIST = 'team/getTeamList';
export const TEAM_LIST_BY_SPORTID = 'team/getTeamListbySportId';
export const ADD_TEAM = 'team/addTeam';
export const REMOVE_TEAM = 'team/deleteTeam';
export const USER_DETAILS = 'user/getUserDetails';
export const TEAM_DETAIL = '/team/getTeamDetail';
export const BLOCK_TEAM = '/team/blockTeam';
export const USER_DELETE = 'user/deleteUser';
export const USERS_DELETE = 'user/deleteUsers';
export const USER_VERIFY = 'user/verifyUser';
export const ADD_USER = 'user/addUser';
export const SEND_MESSAGE = 'user/sendMessage';
export const RESET_GAME_POINTS = 'ladder/updateUserCompPoints';
export const RESET_COMP_GAME_POINTS = 'ladder/updateUserCompGamePoints';
export const RESET_COMP_USER_GAME_POINTS = 'ladder/resetCompUserGamePoints';
export const RESET_ALL_COMP_USER_GAME_POINTS = 'ladder/resetAllCompUserGamePoints';


export const AD_LIST = 'ad/listAd';
export const ADD_AD = 'ad/addUpdateAd';
export const REMOVE_AD = 'ad/deleteAd';




export const FORGOT_PASSWORD = 'f/user/forgotPassword';
export const PRODUCT_LIST = 'f/product/listProduct';
export const PRODUCTS_DETAILS = 'product/getproductDetail';
export const RESET_PASSWORD = 'f/user/resetPassword';
export const CHANGE_PASSWORD = 'user/changePassword';
export const GET_AUTH_DETAILS = 'user/getAuthDetails';
export const USER_UPDATE = 'user/updateUser';
export const TEAM_UPDATE = 'team/updateTeam';
export const PROFILE_PIC_UPDATE = 'user/updateProfilePic';
export const UPDATE_LOGO = 'team/updateTeamLogo'
export const VERIFY_EMAIL = 'f/user/verifyEmail';
export const ADMIN_COUNT_LIST = 'user/getAdminDashboardCounts';
export const ADMIN_GRAPH_STATS = 'user/graphByMonth';
export const BONUS_LIST = 'bonus/listBonus';
export const ADD_BONUS = 'bonus/addBonus';
export const REMOVE_BONUS = 'bonus/deleteBonus';

export const ADD_ROUND = 'round/addRound';
export const ROUND_LIST = 'round/listRounds';
export const BLOCK_ROUND = 'round/blockRound';
export const REMOVE_ROUND = 'round/deleteRound';
export const UPDATE_ROUND = 'round/updateRound';
export const ADD_GAME = 'game/addGames';
export const GAME_LIST = 'game/listGames'
export const REMOVE_GAME = 'game/deleteGame';
export const UPDATE_GAME = 'game/updateGame';
export const UPDATE_GAME_SEASON = 'game/updateGameSeason';

export const TOPIC_LIST = 'topic/listTopic';
export const ADD_TOPIC = 'topic/addupdateTopic';
export const REMOVE_TOPIC = 'topic/deleteTopic';

export const QUESTION_LIST = 'question/listQuestion';
export const ADD_QUESTION = 'question/addupdateQuestion';
export const REMOVE_QUESTION = 'question/deleteQuestion';

export const CONTENT_LIST = 'content/listContent';
export const ADD_CONTENT = 'content/addupdateContent';

export const GET_SETTING = 'setting/getSetting';
export const ADD_SETTING = 'setting/addupdateSetting';
export const CLEAR_SESSION = 'setting/clearCurrentSession';


export const COMPETITION_LIST = 'competition/listCompetition';

export const AUTO_TIPPING = 'tipping/addAutoTipping';
export const GAME_START_NOTIFICATION = 'kingbot/sendGameStartNotification';

export const AD_REPORTS = 'ad/adReports';




/** ROUTE CONSTANT */
export const DASHBOARD = '/dashboard';
export const USER_PROFILE = '/userprofile';
export const PRODUCT_DETAILS = '/productdetails';
export const LOGIN = '/';

/** VALIDATION CONSTANT */

// Create USD currency formatter.
export const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// Create Base64 path.
export function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}