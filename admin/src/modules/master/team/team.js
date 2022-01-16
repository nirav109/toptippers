import React from 'react';
import { Switch, Pagination, Button, Upload, Modal, PageHeader, Form, Input, Spin, Dropdown, Select } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getTeam, removeTeam, addTeam, blockTeam, getSport, getSeason, getTeamBySportId, } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import { getBase64 } from '../../../actions/constant';
import { LOGO_IMG_PATH } from '../../../actions/utilAction';
import { Link } from "react-router-dom";
const { confirm } = Modal;
const { Option } = Select;

class TeamList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            teamData: [],
            teamId: '',
            sortValue: '',
            sortOrder: '',
            imageUrl: '',
            fileObj: '',
            sportData: [],
            sportId: '',
            seasonId: '',
            seasonId2: '',
            loading: true,
            seasonData: [],

        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getTeam(obj);
        let obj1 = {
            count: 1000
        }
        this.props.getSport(obj1);
        this.props.getSeason(obj);
    }

    showModal = (id, name, description) => {
        this.setState({
            visible: true,
            teamId: id
        });
        this.props.form.setFieldsValue({ teamname: name, description: description })
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {

            if (!err) {
                this.setState({ visible: false, currentPage: 0 });
                let formData = new FormData();
                formData.append("teamname", values.teamname)
                formData.append("file", this.state.fileObj)
                formData.append("sportId", this.state.sportId)
                formData.append("seasonId", this.state.seasonId)
                // console.log("formData", formData.append("teamname", values.teamname));
                this.props.addTeam(formData)
                // console.log(values);
                // console.log("seasonId", this.state.seasonId);
                // console.log("sportId", this.state.sportId);

            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    showConfirm(teamId) {
        let self = this;
        let obj = {
            teamId: teamId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.setState({ currentPage: 0 });
                self.props.removeTeam(obj)
            },
            onCancel() { },
        });
    }

    changePage(page, pageSize) {
        this.setState({
            currentPage: page - 1,
        });
        let obj = {
            page: page - 1,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getTeam(obj)
    }

    sortData(sortVal) {
        this.setState({
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        });
        let obj = {
            page: this.state.currentPage,
            sortValue: sortVal,
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        }
        this.props.getTeam(obj)
    }

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

    upload = file => {
        // Get this url from response in real world.
        getBase64(file, imageUrl =>
            this.setState({
                imageUrl,
                fileObj: file,
                changeImage: true
            }),
        );
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.teamData;
        this.setState({ teamData: data, totalRecord: nextProps.totalCount, loading: false })
        let sportdata = nextProps.sportData;
        this.setState({ sportData: sportdata, loading: false })
        let sesData = nextProps.seasonData;
        this.setState({ seasonData: sesData, loading: false })
    }
    blockTeam(teamId) {
        let values = {
            teamId: teamId,
        }
        this.props.blockTeam(values);
    }

    handleMenuClick(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            sportId: value
        });
    }


    handleMenuClick1(values) {
        // console.log("values isss", values);
        let obj = {
            "seasonId": values
        }
        // console.log("obj obj ", obj);
        this.setState({
            seasonId: values
        })
        if (obj.seasonId == '') {
            let obj1 = {
                page: this.state.currentPage,
                sortValue: this.state.sortValue,
                sortOrder: this.state.sortOrder
            }
            this.props.getSport(obj1);

        } else {
            this.props.getSport(obj);
        }
    }


    handleMenuClick2(values) {
        // console.log("values isss", values);
        let obj = {
            "seasonId": values
        }
        // console.log("obj obj ", obj);
        this.setState({
            seasonId2: values
        })
        if (obj.seasonId2 == '') {
            let obj1 = {
                page: this.state.currentPage,
                sortValue: this.state.sortValue,
                sortOrder: this.state.sortOrder
            }
            this.props.getSport(obj1);

        } else {
            this.props.getSport(obj);
        }
    }

    getFilterTeam(values) {
        let obj = {
            "sportId": values
        }
        let obj1 = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        console.log("dataaaaa", obj);
        if (obj.sportId == "") {

            this.props.getTeam(obj1)

        } else {
            this.props.getTeamBySportId(obj)
        }
        this.props.getSeason(obj1)

    }


    render() {

        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const sport = state.sportData.map((x, index) =>
            <Option value={x._id}>{x.sportname}</Option>
        );

        let profilePic = state.imageUrl ? state.imageUrl : '';
        const team = state.teamData.map((x, index) => <tr key={index}>
            <td>{x.teamname}</td>
            {x && x.sport ? <td>{x.sport.sportname}</td> : ''}
            <td><img src={LOGO_IMG_PATH + x.teamLogo} alt="profile" style={{ height: "60px", width: "60px" }} /></td>
            <td> <Switch checked={x.isActive} onChange={this.blockTeam.bind(this, x._id)} /></td>
            <td>
                {/* <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.teamname, x.description)}><i className="fa fa-pencil"></i></Button> */}
                <Link to={"/teamdetail/" + x._id}> <Button className="btn btn-info btn-sm mr-2"><i className="fa fa-eye"></i></Button></Link>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="TEAM"
                    subTitle=""
                    extra={[
                        // <Select placeholder="Sport" style={{ width: 150 }}
                        //     onChange={this.getFilterTeam.bind(this)}
                        // >
                        //     <Option value="">{"All Team"}
                        //     </Option>
                        //     {
                        //         this.state.seasonId2 == "" ? "" : sport
                        //     }
                        // </Select>,
                        // <Select placeholder="Season" style={{ width: 150 }}
                        //     onChange={this.handleMenuClick2.bind(this)}
                        // >

                        //     {
                        //         state.seasonData.map((x, index) =>
                        //             <   Option value={x._id} key={index}>{x.seasonname}</Option>
                        //         )
                        //     }
                        // </Select>,
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Team</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'teamname')} className="cursor-pointer">Team Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'teamname')} className="cursor-pointer">Sport {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" className="cursor-pointer">Logo</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} current={this.state.currentPage + 1} defaultCurrent={this.state.currentPage + 1} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Team"
                            backBtnText="Back"
                            submitBtnText="Submit">

                            <Form className="team-form l_hgt0">
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action={this.upload}
                                    onChange={this.handleChange}>

                                    <img src={profilePic ? profilePic : "http://placehold.it/380x500"} alt="profile" className="img-rounded img-responsive img-104" />

                                </Upload>
                                <Form.Item label="Team Name">
                                    {getFieldDecorator('teamname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter team' }],
                                    })(
                                        <Input placeholder="Team" />,
                                    )}
                                </Form.Item>
                                <br />
                                <label>Sports :</label>
                                <br />

                                {/* <Dropdown overlay={<Menu onClick={this.handleMenuClick}>{sport} </Menu>}>
                               
                                    <Button>
                                        Button 
                                    </Button>
                                </Dropdown> */}
                                <Select defaultValue="sport" style={{ width: 120 }} onChange={this.handleMenuClick.bind(this)}>
                                    {sport}
                                </Select>
                            </Form>
                        </CustomModal>
                    </div>
                </Spin>
            </div>
        </>
        );
    }

}
function mapStateToProps(state) {
    return {
        teamData: state.admin.teamData,
        totalCount: state.admin.teamCount,
        sportData: state.admin.sportData,
        seasonData: state.admin.seasonData
    };
}
const Team = Form.create({ name: 'team' })(TeamList);
export default connect(mapStateToProps, { getTeam, addTeam, removeTeam, blockTeam, getSport, getSeason, getTeamBySportId })(Team);
