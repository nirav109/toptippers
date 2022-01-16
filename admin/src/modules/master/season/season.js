import React from 'react';
import { Switch, Checkbox, Pagination, Button, Modal, PageHeader, Row, Col, Form, Input, Spin, Select, DatePicker } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getSport, removeSport, addSport, resetGamePoints, getSeason, getSportSeason, addSeason, removeSeason, blockSeason } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import { get } from 'request';
import { Link } from "react-router-dom";
const { confirm } = Modal;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
const { RangePicker } = DatePicker;
const list = []
class SeasonList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            sportData: [],
            sportId: '',
            sortValue: '',
            sortOrder: '',
            loading: true,
            seasonData: [],
            selectedSport: [],
            checked: true
        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }

        let obj1 = {
            count: 1000
        }
        this.props.getSeason(obj);
        this.props.getSport(obj1);
    }

    showModal = (id, name, description, seasonId) => {
        this.setState({
            visible: true,
            sportId: id,
        });
        if (id !== "") {
            this.setState({
                isSportUpdate: true
            });
            this.props.form.setFieldsValue({ sportname: name, description: description, seasonId: seasonId })
        } else {
            this.props.form.resetFields();
        }
    };

    handleOk = () => {

        this.props.form.validateFields((err, values) => {
            let self = this;
            let obj = {
                seasonname: values.seasonname,
                startDate: values.date[0].format(),
                endDate: values.date[1].format(),
                sport: values.sport
            };

            if (err) {
                confirm({
                    title: "Pleasse enter details",
                    onOk() { },
                    onCancel() { }
                })
            } else {
                if (values == "") {

                } else {

                    confirm({
                        title: `Adding Season you can't editable so please confirm`,
                        onOk() {

                            console.log("obj isss", obj);
                            self.props.addSeason(obj);
                            self.setState({ visible: false });
                            self.props.form.resetFields()

                        },
                        onCancel() { }

                    })
                }

            }
        })

        // this.props.form.validateFields((err, values) => {
        //     let obj = {
        //         sportname: values.sportname,
        //         description: values.description,
        //         sportId: this.state.sportId,
        //         seasonId: values.seasonId
        //     }
        //     this.setState({
        //         isSportUpdate: false
        //     });
        //     // console.log("this  issssssss", obj);
        //     if (!err) {
        //         this.setState({ visible: false });
        //         this.props.addSport(obj)
        //     } else {
        //         this.props.form.resetFields();
        //     }
        // });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    showConfirm(sportId) {
        let self = this;
        let obj = {
            sportId: sportId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.props.removeSport(obj)
            },
            onCancel() { },
        });
    }

    showConfirmResetPoints(sportId) {
        let self = this;
        let obj = {
            params: {
                sportId: sportId
            }
        }
        confirm({
            title: "Do you want to reset game points?",
            content: '',
            onOk() {
                self.props.resetGamePoints(obj)
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
        this.props.getSport(obj)
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
        this.props.getSport(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.sportData;
        this.setState({ sportData: data, loading: false })
        let sesData = nextProps.seasonData;
        this.setState({ seasonData: sesData, totalRecord: nextProps.totalCount, loading: false })
    }

    handleMenuClick(values) {
        // console.log("values isss", values);
        let obj = {
            "seasonId": values
        }
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

    showSessionConfirm() {
        let self = this;
        // confirm({
        //   title: "Are you sure you want to start new season?",
        //   content: "",
        //   onOk() {
        //     // self.props.clearSession();
        //     self.setState({
        //       modelVisible: true,
        //     });
        //   },
        // onCancel() { },
        this.state.sportData.map(x => this.setState({ selectedSport: x.sportname }))
        self.setState({
            visible: true,
        });
    }

    onChange = (e) => {
        console.log(`checked = ${e}`)
        // console.log(e.length == this.state.sportData.map((x, index) => x.sportname));
        // console.log(this.state.selectedSport);
    };

    blockSeason(seasonId) {
        let values = {
            seasonId: seasonId,
        }
        this.props.blockSeason(values);
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getSeason(obj);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        // const sport = state.sportData.map(x => this.setState({ selectedSport: x.sportname }))

        const season = state.seasonData.map((x, index) => <tr key={index}>
            <td>{x.seasonname}</td>
            <td>{x.startDate}</td>
            <td>{x.endDate}</td>
            <td><Switch checked={x.isActive}
                onChange={this.blockSeason.bind(this, x._id)}
            /> </td>
            <td>
                {/* <Link
                    to={"/seasondetail/" + x._id}
                >
                    <Button className="btn btn-info btn-sm mr-2"><i className="fa fa-eye"></i></Button>
                </Link> */}
                {/* <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.sportname, x.description, x.seasonId)}><i className="fa fa-pencil"></i></Button> */}
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
                {/* <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirmResetPoints.bind(this, x._id)}><i className="fa fa-anchor"></i></Button> */}
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="Season"
                    subTitle=""
                    extra={[
                        <Button
                            type="primary"
                            onClick={this.showSessionConfirm.bind(this)}
                            style={{
                                float: "right",
                            }}
                        >
                            Start New Season
                        </Button>
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sportname')} className="cursor-pointer">Season Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sportname')} className="cursor-pointer">Start Date </th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sportname')} className="cursor-pointer">End Date </th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {season}
                            </tbody>
                        </table>
                        {/* <Pagination style={{ 'textAlign': 'right' }} pageSize={5} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} /> */}
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Season"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Season Name">
                                    {getFieldDecorator('seasonname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter Season name' }],

                                    })(
                                        <Input placeholder="Enter Season Name" />,
                                    )}
                                </Form.Item>

                                <Form.Item label="Select start date and end date">
                                    {getFieldDecorator("date", {
                                        rules: [
                                            { required: true, message: "Please enter date range" },
                                        ],
                                    })(
                                        <RangePicker
                                            disabled={this.state.isRoundUpdate}
                                            placeholder="Date"
                                        />
                                    )}
                                </Form.Item>

                                <Form.Item label="Sport List" name="sport-list">
                                    {getFieldDecorator('sport', {
                                        rules: [{ required: true, }],

                                    })(
                                        // <Checkbox.Group style={{ width: '100%' }}
                                        //     onChange={this.onChange}

                                        //     options={this.state.sportData.map(x => ({ label: x.sportname, checked: true, value: x.sportname, }))}
                                        //     defaultValue={this.state.sportData.map(x => x.sportname)}

                                        // />
                                        // this.state.sportData.map((x, index) => {
                                        //     return (
                                        //         <Input type="checkbox" value={x.sportname} name="vehicle1" />
                                        //     )
                                        // })



                                        <Checkbox.Group
                                            options={this.state.sportData.map(x => ({ label: x.sportname, value: x.sportname }))}
                                            //value={ValueType['new']}
                                            onChange={this.onChange}
                                            defaultValue={list}
                                            checked={true}

                                        />
                                        // <Checkbox onChange={this.onChanges} value="something">Remember me</Checkbox>


                                        // <Checkbox.Group style={{ width: '100%' }}
                                        //     // value={this.state.sportData.map((x, index) => [x.sportname])}
                                        //     onChange={this.onChange}
                                        // >
                                        //     <Row>

                                        //         {
                                        //             this.state.sportData.map((x, index) => {
                                        //                 return (
                                        //                     <Col span={8}>
                                        //                         {/* <Checkbox checked={"true"} defaultChecked="true" defaultChecked={this.state.sportData.map((x, index) => x.sportname)} value={x._id}>{x.sportname}</Checkbox> */}
                                        //                         <Input type="checkbox" value={x.sportname} onChange={this.onChange} /> {x.sportname}
                                        //                     </Col>
                                        //                 )
                                        //             })
                                        //         }
                                        //     </Row>
                                        // </Checkbox.Group>,
                                    )}

                                </Form.Item>

                                {/* <Checkbox.Group
                                    options={this.state.sportData.map(x => ({ label: x.sportname, value: x.sportname, checked: "true" }))}
                                    defaultValue={[this.state.sportData.map((x) => { return x.sportname }
                                    )]}
                                    checked
                                    onChange={this.onChange}

                                /> */}

                            </Form>
                        </CustomModal>

                    </div>
                </Spin>
            </div >
        </>
        );
    }

}
function mapStateToProps(state) {
    return {
        sportData: state.admin.sportData,
        totalCount: state.admin.sportCount,
        seasonData: state.admin.seasonData
    };
}
const season = Form.create({ name: 'season' })(SeasonList);
export default connect(mapStateToProps, { getSport, addSport, removeSport, resetGamePoints, getSeason, getSportSeason, addSeason, removeSeason, blockSeason })(season);
