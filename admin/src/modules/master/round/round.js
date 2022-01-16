import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin, Select, Switch, DatePicker, InputNumber } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getRound, getSport, removeRound, addRound, blockRound, updateRound, getSeason } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import moment from 'moment';
const { RangePicker } = DatePicker;


const { confirm } = Modal;
const { Option } = Select;

class RoundList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            sportData: [],
            roundData: [],
            roundTypeData: [{ id: 1, name: 'Regular Season' }, { id: 2, name: 'Playoffs' }],
            sportId: '',
            roundId: '',
            isRoundUpdate: false,
            sortValue: '',
            sortOrder: '',
            loading: true,
            seasonData: [],
            seasonId: '',
            seasonId2: '',
            tchangePage: '',

        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getRound(obj);
        let obj1 = {
            count: 1000
        }
        this.props.getSport(obj1);
        this.props.getSeason(obj);
    }

    showModal = (id, roundno, roundname, roundtype, sport, startDate, endDate,) => {
        this.setState({
            visible: true,
            roundId: id,
            sportId: sport._id
        });
        if (id !== "") {
            this.setState({
                isRoundUpdate: true
            });
            this.props.form.resetFields();
            this.props.form.setFieldsValue({ roundno: roundno, roundname: roundname, roundtype: roundtype, sport: sport._id, date: [moment(new Date(startDate)), moment(new Date(endDate))] })
        } else {
            var sDate = new Date();
            sDate.setDate(sDate.getDate() + (7 - sDate.getDay()) % 7 + 1);
            var eDate = new Date(sDate);
            eDate.setDate(eDate.getDate() + (6 - eDate.getDay()) % 6 + 1);

            this.setState({
                isRoundUpdate: false
            });
            this.props.form.resetFields();
            this.props.form.setFieldsValue({ roundno: 1, date: [moment(sDate), moment(eDate)] });

        }

    };

    handleMenuClick(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            sportId: value
        });


        this.setFieldsValue(value);
    }
    handleRoundTypeClick(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            roundtype: value
        });
    }

    setFieldsValue(sportId) {
        if (sportId) {
            var rounds = this.state.roundData;
            var sportRounds = rounds.filter(round => round.sport._id == sportId);
            if (sportRounds.length > 0) {
                if (sportRounds.length > 1) {
                    sportRounds = sportRounds.sort((a, b) => a.roundno - b.roundno);
                }
                var round = sportRounds[sportRounds.length - 1];
                var sDate = new Date(round.startDate);
                sDate.setDate(sDate.getDate() + (7 - sDate.getDay()) % 7 + 1);
                var eDate = new Date(sDate);
                eDate.setDate(eDate.getDate() + (6 - eDate.getDay()) % 6 + 1);

                this.props.form.setFieldsValue({ roundno: round.roundno + 1, date: [moment(sDate), moment(eDate)] });
            } else {
                var sDate = new Date();
                sDate.setDate(sDate.getDate() + (7 - sDate.getDay()) % 7 + 1);
                var eDate = new Date(sDate);
                eDate.setDate(eDate.getDate() + (6 - eDate.getDay()) % 6 + 1);
                this.props.form.setFieldsValue({ roundno: 1, date: [moment(sDate), moment(eDate)] });

            }



        }
    }

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ visible: false, currentPage: 0 });
                if (this.state.isRoundUpdate) {
                    let obj = {
                        roundId: this.state.roundId,
                        // roundtype: this.state.roundtype,
                        // roundno: values.roundno,
                        roundname: values.roundname,
                        // sportId: this.state.sportId,
                        // startDate: values.startDate,
                        // endDate: values.endDate
                    }
                    this.props.updateRound(obj);
                    this.setState({ isRoundUpdate: false });
                } else {
                    let obj = {
                        roundno: values.roundno,
                        roundname: values.roundname,
                        roundtype: this.state.roundtype,
                        sportId: this.state.sportId,
                        // seasonId: this.state.seasonId,
                        startDate: values.date[0],
                        endDate: values.date[1]
                    }
                    console.log("cbj cobj ", obj);
                    this.props.addRound(obj);
                }

            } else {
            }
        });
    };

    blockRound(roundId) {
        let values = {
            roundId: roundId,
        }
        this.props.blockRound(values);
    }

    handleCancel = () => {
        this.setState({ visible: false });
    };

    showConfirm(roundId) {
        let self = this;
        let obj = {
            roundId: roundId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.setState({ currentPage: 0 });
                self.props.removeRound(obj)
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
        this.props.getRound(obj)
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
        this.props.getRound(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.roundData;
        this.setState({ roundData: data, totalRecord: nextProps.totalCount, loading: false })
        let sportdata = nextProps.sportData;
        this.setState({ sportData: sportdata, loading: false })
        let sesData = nextProps.seasonData;
        this.setState({ seasonData: sesData })
    }


    handleMenuClick1(values) {
        // console.log("values isss", values);
        let obj = {
            "seasonId": values
        }
        console.log("obj obj ", obj);
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

    handleMenuClickSeason(values) {
        let obj = {
            "seasonId": values
        }
        console.log("obj obj =======", obj);
        this.setState({
            seasonId2: values
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

    handleMenuClickSport(values) {
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

            this.props.getRound(obj1)

        } else {
            this.props.getRound(obj)
        }
        this.props.getSeason(obj1)
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const sport = state.sportData.map((x, index) =>
            <Option value={x._id}>{x.sportname}</Option>
        );

        const round = state.roundData.map((x, index) => <tr key={index}>
            <td>{x.roundno}</td>
            <td>{x.roundname}</td>
            <td>{x.roundtype}</td>
            <td>{x.sport.sportname}</td>
            {/* { console.log("round Dataaa", x)} */}
            {/*<td><Switch checked={x.isActive} onChange={this.blockRound.bind(this, x._id)} /></td>*/}
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.roundno, x.roundname, x.roundtype, x.sport, x.startDate, x.endDate,)}><i className="fa fa-pencil"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="ROUND"
                    subTitle=""
                    extra={[
                        // <Select defaultValue="" placeholder="Season" style={{ width: 150 }}
                        //     onChange={this.handleMenuClickSport.bind(this)}
                        // >
                        //     <   Option value="" >Sports</Option>
                        //     {
                        //         this.state.seasonId2 == '' ? '' : sport
                        //     }
                        // </Select>,
                        // <Select defaultValue="" placeholder="Sport" style={{ width: 150 }}
                        //     onChange={this.handleMenuClickSeason.bind(this)}
                        // >
                        //     <   Option value='' >Season</Option>
                        //     {
                        //         state.seasonData.map((x, index) =>
                        //             <   Option value={x._id} key={index}>{x.seasonname}</Option>
                        //         )
                        //     }
                        // </Select>,
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "", "")}>Add Round</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'roundno')} className="cursor-pointer">Round No {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'roundname')} className="cursor-pointer">Round Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'roundtype')} className="cursor-pointer">Type {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sport.sportname')} className="cursor-pointer">Sports {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    {/*<th scope="col">Status</th>*/}
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {round}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} current={this.state.currentPage + 1} defaultCurrent={this.state.currentPage + 1} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Round"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                {/* <Form.Item label="Select Season">
                                    {getFieldDecorator('season', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select Season' }],
                                        initialValue: this.state.isRoundUpdate ? ['season'] : null
                                    })(
                                        <Select disabled={this.state.isRoundUpdate} style={{ width: 200 }} onChange={this.handleMenuClick1.bind(this)}>
                                            {
                                                state.seasonData.map((x, index) =>
                                                    <   Option value={x._id} key={index}>{x.seasonname}</Option>
                                                )
                                            }
                                        </Select>
                                    )}
                                </Form.Item> */}
                                <Form.Item label="Select Sport">
                                    {getFieldDecorator('sport', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select sport' }],
                                        initialValue: this.state.isRoundUpdate ? ['sport'] : null
                                    })(
                                        <Select disabled={this.state.isRoundUpdate} style={{ width: 200 }} onChange={this.handleMenuClick.bind(this)}>
                                            {sport}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Round No">
                                    {getFieldDecorator('roundno', {
                                        rules: [{ required: true, message: 'Please enter round no' }],
                                    })(
                                        <InputNumber disabled={true} placeholder="Round No" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Round Name">
                                    {getFieldDecorator('roundname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter round name' }],
                                    })(
                                        <Input placeholder="Round Name" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Select Type">
                                    {getFieldDecorator('roundtype', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select Type' }],
                                        initialValue: this.state.isRoundUpdate ? ['roundtype'] : null
                                    })(
                                        <Select disabled={this.state.isRoundUpdate} style={{ width: 200 }} onChange={this.handleRoundTypeClick.bind(this)}>
                                            {this.state.roundTypeData.map((x, index) =>
                                                <Option value={x.name} key={index}>{x.name}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Select start date and end date">
                                    {getFieldDecorator('date', {
                                        rules: [{ required: true, message: 'Please enter date range' }],
                                    })(
                                        <RangePicker disabled={this.state.isRoundUpdate} placeholder="Date" />
                                    )}
                                </Form.Item>

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
        roundData: state.admin.roundData,
        totalCount: state.admin.roundCount,
        sportData: state.admin.sportData,
        seasonData: state.admin.seasonData
    };
}
const Round = Form.create({ name: 'round' })(RoundList);
export default connect(mapStateToProps, { getRound, addRound, removeRound, getSport, blockRound, updateRound, getSeason })(Round);
