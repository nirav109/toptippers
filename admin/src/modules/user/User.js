import React from 'react';
import { Switch, Pagination, Input, Modal, PageHeader, Button, Form, Upload } from 'antd';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import * as constant from '../../actions/constant';
import { getUsers, deleteUser, deActivateUser, addUser, verifyUser } from './actions/userActions';
import CustomModal from '../../components/common/CustomModal';
import { getBase64 } from '../../actions/constant';
const { confirm } = Modal;
class Users extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            search_string: '',
            userData: [],
            sortValue: '',
            sortOrder: '', //asc
            visible: false,
            imageUrl: '',
            fileObj: ''
        };
    }

    componentDidMount() {
        let obj = {
            search_string: this.state.search_string,
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getUsers(obj);
    }

    searchString(e) {
        this.setState({
            search_string: e.target.value
        });
        let obj = {
            search_string: e.target.value,
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getUsers(obj)
    }

    changePage(page, pageSize) {
        this.setState({
            currentPage: page - 1,
        });
        let obj = {
            search_string: this.state.search_string,
            page: page - 1,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getUsers(obj)
    }

    sortData(sortVal) {
        this.setState({
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        });
        let obj = {
            search_string: this.state.search_string,
            page: this.state.currentPage,
            sortValue: sortVal,
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        }
        this.props.getUsers(obj)
    }

    showConfirm(userId) {
        let self = this;
        let obj = {
            userId: userId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() { self.props.deleteUser(obj) },
            // onCancel() { },
        });
    }

    showVerificationConfirm(userId) {
        let self = this;
        let obj = {
            userId: userId
        }
        confirm({
            title: constant.VERIFY_RECORD,
            content: '',
            onOk() { self.props.verifyUser(obj) },
            // onCancel() { },
        });
    }

    deActivateUser(userId) {
        let values = {
            userId: userId,
        }
        this.props.deActivateUser(values);
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.userData;
        this.setState({ userData: data, totalRecord: nextProps.totalCount, loading: false })
    }
    showModal = (id, name, description) => {
        this.setState({
            visible: true,
            bonusId: id
        });
        this.props.form.setFieldsValue({ bonusname: name, description: description })
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
                    fileObj: info.file.originFileObj,
                    changeImage: true
                }),
            );

        }
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            console.log("value", values, this.state.fileObj)
            if (!err) {
                this.setState({ visible: false });
                let formData = new FormData();
                formData.append("name", values.name)
                formData.append("email", values.email)
                formData.append("password", values.password)
                formData.append("file", this.state.fileObj)
                this.props.addUser(formData)
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;
        let profilePic = state.imageUrl ? state.imageUrl : '';

        const users = state.userData.map((x, index) => {
            if (x.role.rolename == 'user' || x.role.rolename == "kingbot") {
                return (<tr key={index}>
                    <td>{x.name}</td>
                    <td>{x.email}</td>
                    {/* <td>{x.address ? x.address : '-'}</td> */}
                    <td> <Switch checked={x.isActive} onChange={this.deActivateUser.bind(this, x._id)} /></td>
                    <td> <Link to={"/userprofile/" + x._id}> <Button className="btn btn-info btn-sm mr-2"><i className="fa fa-eye"></i></Button></Link>
                        {x.role.rolename == "user" ? <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button> : null}
                        {!x.isVerified ? <Button className="btn btn-info btn-sm" onClick={this.showVerificationConfirm.bind(this, x._id)}><i className="fa fa-envelope"></i></Button> : null}
                    </td>

                </tr>)
            }
        });

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="USERS"
                    subTitle=""
                    extra={[
                        <Input placeholder="Search" onChange={this.searchString.bind(this)} key="search" style={{ width: 'auto' }} />,

                        // <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add User</Button>,

                    ]}
                />
                <div className="box-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col" onClick={this.sortData.bind(this, 'name')} className="cursor-pointer">Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                <th scope="col">Email</th>
                                {/* <th scope="col">Address</th> */}
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users}
                        </tbody>
                    </table>
                    <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} onChange={this.changePage.bind(this)} total={this.state.totalRecord ? this.state.totalRecord : 1} />
                    <CustomModal
                        handleCancel={this.handleCancel}
                        handleOk={this.handleOk}
                        visible={this.state.visible}
                        title="User"
                        backBtnText="Back"
                        submitBtnText="Submit">

                        <Form className="team-form l_hgt0">
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                onChange={this.handleChange}>

                                <img src={profilePic ? profilePic : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" />

                            </Upload>
                            <Form.Item label="User Name">
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, whitespace: true, message: 'Please enter name' }],
                                })(
                                    <Input placeholder="User Name" />,
                                )}
                            </Form.Item>
                            <Form.Item label="Email Id">
                                {getFieldDecorator('email', {
                                    rules: [{ required: true, whitespace: true, message: 'Please enter email id' }],
                                })(
                                    <Input placeholder="Email Id" />,
                                )}
                            </Form.Item>
                            <Form.Item label="Password">
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, whitespace: true, message: 'Please enter Password' }],
                                })(
                                    <Input placeholder="Password" />,
                                )}
                            </Form.Item>
                        </Form>
                    </CustomModal>
                </div>
            </div>
        </>
        )
    }

}

function mapStateToProps(state) {
    return {
        userData: state.user.userData,
        totalCount: state.user.totalCount,

    };
}
const Userss = Form.create({ name: 'users' })(Users);
export default connect(mapStateToProps, { getUsers, deleteUser, deActivateUser, addUser, verifyUser })(Userss);

