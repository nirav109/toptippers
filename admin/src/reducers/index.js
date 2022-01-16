import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'; // SAYING use redux form reducers as reducers
import userReducer from '../modules/user/reducers/userReducer';
import adminReducer from '../modules/admin/reducers/adminReducer';
const allReducers = combineReducers({
    form: formReducer,
    user: userReducer,
    admin: adminReducer
});

export default allReducers;