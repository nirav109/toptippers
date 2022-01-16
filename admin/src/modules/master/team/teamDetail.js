import React from 'react';
import { PageHeader, Form, Input, Upload } from 'antd';
import { getTeamDetails, updateTeam, updateTeamLogo } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import moment from 'moment';
import history from '../../../history';
import CustomModal from '../../../components/common/CustomModal';
import { getBase64 } from '../../../actions/constant';

import autoBind from 'react-autobind';
import { LOGO_IMG_PATH } from '../../../actions/utilAction';


class TeamDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            teamDetails: '',
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
            teamId: this.props.match.params.teamId
        }
        // console.log("obj-------------", obj)
        this.props.getTeamDetails(obj);
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
        let team = this.state.teamDetails ? this.state.teamDetails : this.props.teamDetails;
        this.props.form.setFieldsValue({
            teamname: team.teamname,
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
            formData.append("teamId", this.props.match.params.teamId)
            this.props.updateTeamLogo(formData)
        }
    };

    upload = file => {
        let formData = new FormData();
        formData.append("file", file)
        formData.append("teamId", this.props.match.params.teamId)
        this.props.updateTeamLogo(formData)
    }


    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            // console.log("values-----",values)

            if (!err) {
                this.setState({ visible: false });
                let obj = {
                    teamname: values.teamname,
                    teamId: this.props.match.params.teamId
                }
                this.props.updateTeam(obj)
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    componentWillReceiveProps(nextProps) {
        // console.log("nextProps--------",nextProps)
        this.setState({
            teamDetails: nextProps.teamDetails,
            loading: false,
            changeImage: false,
            imageUrl: nextProps.teamDetails.teamLogo
        })
    }

    render() {

        let state = this.state;
        let team = state.teamDetails ? state.teamDetails : '';

        let teamLogo = state.imageUrl ? state.imageUrl : this.props.teamDetails.teamLogo;
        const { getFieldDecorator } = this.props.form;

        return (<>
            <div className="overflowBox">
                <PageHeader
                    title="TEAM PROFILE"
                    subTitle="" />
                <div className="box box-default mb-4">
                    <div className="box-body">
                        <div className="row profileDetails">
                            <div className="col-sm-6 col-md-6">
                                <div className="row">
                                    <div className="col-sm-6 col-md-4">
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            action={this.upload}
                                            onChange={this.handleChange}>

                                            {state.changeImage ? <img src={teamLogo ? teamLogo : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" /> :
                                                <img src={teamLogo ? LOGO_IMG_PATH + teamLogo : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" />}

                                        </Upload>

                                    </div>
                                    <div className="col-sm-6 col-md-6">
                                        <h4>
                                            <i className="fa fa-users"></i>   {team.teamname} &nbsp;
                                        </h4>
                                        {team && team.sport ? <h4>
                                            <i className=" fa fa-soccer-ball-o"></i> {team.sport.sportname} &nbsp;
                                        </h4> : ''}

                                        {/* <p>
                                            <i className="fa fa-envelope"></i>
                                            <br />
                                            <i className="fa fa-gift"></i> </p> */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-md-6" style={{ textAlign: 'right' }}>
                                <i className="fa fa-pencil btn" onClick={this.showModal}></i>
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
                title="Team Details"
                backBtnText="Back"
                submitBtnText="Submit">
                <Form className="profile-form l_hgt0">
                    <Form.Item label="Teamname">
                        {getFieldDecorator('teamname', {
                            rules: [{ transform: (value) => value.trim() },
                            { required: true, message: 'Please enter team name' }],
                        })(
                            <Input placeholder="Enter Team Name" />,
                        )}
                    </Form.Item>
                </Form>
            </CustomModal>
        </>
        );
    }

}
function mapStateToProps(state) {

    return {

        teamDetails: state.admin.teamDetails
    };
}
const TeamProfile = Form.create({ name: 'profile' })(TeamDetails);
export default connect(mapStateToProps, { getTeamDetails, updateTeam, updateTeamLogo })(TeamProfile);

