import React from 'react';
import { PageHeader, Form, Input, Upload } from 'antd';
import { getUserDetails, updateProfile, updateProfilePic } from './actions/userActions';
import { connect } from 'react-redux';
import moment from 'moment';
import history from '../../history';
import CustomModal from '../../components/common/CustomModal';
import { getBase64 } from '../../actions/constant';

import autoBind from 'react-autobind';
import { PROFILE_IMG_PATH } from '../../actions/utilAction';


class Profile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userDetails: '',
            productList: [],
            loading: false,
            page: 0,
            imageUrl: '',
            visible: false,
            changeImage: false
        }
        autoBind(this);
    }

    componentDidMount() {
        let obj = {
            userId: this.props.match.params.userId
        }

        this.props.getUserDetails(obj);
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
        let user = this.state.userDetails ? this.state.userDetails : this.props.userDetails;
        this.props.form.setFieldsValue({
            name: user.name,
        })
    };

    handleChange = info => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    changeImage: true
                }),
            );
            let formData = new FormData();
            formData.append("file", info.file.originFileObj)
            formData.append("email", this.state.userDetails.email)
            this.props.updateProfilePic(formData, this.state.userDetails._id)
        }
    };


    handleOk = () => {
        let userDetails = this.state.userDetails;
        this.props.form.validateFields((err, values) => {
            let obj = {
                name: values.name,
                userId: userDetails._id
            }
            if (!err) {
                userDetails.name = values.name;
                this.setState({ visible: false, userDetails });
                this.props.updateProfile(obj)
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    componentWillReceiveProps(nextProps) {

        this.setState({
            userDetails: nextProps.userDetails,
            loading: false,
            changeImage: false,
            imageUrl: nextProps.userDetails.profilePhoto
        })
    }

    render() {

        let state = this.state;
        let user = state.userDetails ? state.userDetails : '';
        let profilePic = state.imageUrl ? state.imageUrl : this.props.userDetails.profilePhoto;
        const { getFieldDecorator } = this.props.form;

        return (<>
            <div className="overflowBox">
                <PageHeader
                    title="PROFILE"
                    subTitle="" />
                <div className="box box-default mb-4">
                    <div className="box-body">
                        <div className="row profileDetails">
                            <div className="col-sm-6 col-md-6">
                                <div className="row">
                                    <div className="col-sm-6 col-md-4">
                                        <Upload
                                            disabled={true}
                                            name="avatar"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            onChange={this.handleChange}>

                                            {state.changeImage ? <img src={profilePic ? profilePic : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" /> :
                                                <img src={profilePic ? PROFILE_IMG_PATH + profilePic : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" />}

                                        </Upload>

                                    </div>
                                    <div className="col-sm-6 col-md-6">
                                        <h4>
                                            {user.name} &nbsp;
                                        </h4>

                                        <p>
                                            <i className="fa fa-envelope"></i> {user.email}
                                            <br />
                                            <i className="fa fa-gift"></i> Joined: {moment(user.joinedDate).format('LL')}</p>

                                        {/* <div className="btn-group">
                                            <button type="button" className="btn btn-primary">
                                                Social</button>
                                            <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                                                <span className="caret"></span><span className="sr-only">Social</span>
                                            </button>
                                            <ul className="dropdown-menu" role="menu">
                                                <li><a href="#">Twitter</a></li>
                                                <li><a href="https://plus.google.com/+Jquery2dotnet/posts">Google +</a></li>
                                                <li><a href="https://www.facebook.com/jquery2dotnet">Facebook</a></li>
                                                <li className="divider"></li>
                                                <li><a href="#">Github</a></li>
                                            </ul>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-md-6" style={{ textAlign: 'right' }}>
                                {/* <i className="fa fa-pencil btn" onClick={this.showModal}></i> */}
                            </div>
                        </div>
                        {/* <hr /> */}
                    </div>
                </div>
            </div>
            <CustomModal
                handleCancel={this.handleCancel}
                handleOk={this.handleOk}
                visible={this.state.visible}
                title="Profile Details"
                backBtnText="Back"
                submitBtnText="Submit">
                <Form className="profile-form l_hgt0">
                    <Form.Item label="User Name">
                        {getFieldDecorator('name', {
                            rules: [{ transform: (value) => value.trim() },
                            { required: true, message: 'Please enter your name' }],
                        })(
                            <Input placeholder="Enter Name" />,
                        )}
                    </Form.Item>
                </Form>
            </CustomModal>
        </>
        )
    }

}
function mapStateToProps(state) {
    return {
        userDetails: state.user.userDetails,
    };
}
const UserProfile = Form.create({ name: 'profile' })(Profile);
export default connect(mapStateToProps, { getUserDetails, updateProfile, updateProfilePic })(UserProfile);

