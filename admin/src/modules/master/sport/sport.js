import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin, Select } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getSport, removeSport, addSport, resetGamePoints, getSeason, getSportSeason } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import { get } from 'request';
const { confirm } = Modal;
const { Option } = Select;

class SportList extends React.Component {
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
            isSportUpdate: false,
            sportTypeData: [{ id: 1, name: 'Regular' }, { id: 2, name: 'Draw' }],
        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getSport(obj);
    }

    showModal = (id, name, description, type) => {
        this.setState({
            visible: true,
            sportId: id,
        });
        if (id !== "") {

            this.props.form.setFieldsValue({ sportname: name, description: description, type: type })
        } else {
            this.props.form.resetFields();
        }
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let obj = {
                sportname: values.sportname,
                description: values.description,
                sportId: this.state.sportId,
                type: values.type
            }
            this.setState({
                isSportUpdate: false
            });
            console.log("this  issssssss", obj);
            if (!err) {
                this.setState({ visible: false });
                this.props.addSport(obj)
            } else {
                this.props.form.resetFields();
            }
        });
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
        this.setState({ sportData: data, totalRecord: nextProps.totalCount, loading: false })
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

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;
        const sport = state.sportData.map((x, index) => <tr key={index}>
            <td>{x.sportname}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.sportname, x.description, x.type)}><i className="fa fa-pencil"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
                {/* <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirmResetPoints.bind(this, x._id)}><i className="fa fa-anchor"></i></Button> */}
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="SPORT"
                    subTitle=""
                    extra={[

                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Sport</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sportname')} className="cursor-pointer">Sport Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sport}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Sport"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Sport Name">
                                    {getFieldDecorator('sportname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter sport' }],

                                    })(
                                        <Input placeholder="Sport" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Description">
                                    {getFieldDecorator('description', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter description' }],
                                    })(
                                        <Input placeholder="Description" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Sport Type">
                                    {
                                        getFieldDecorator('type', {
                                            rules: [{ required: true, whitespace: true, message: "Please enter sport type " }]
                                        })(
                                            <Select disabled={this.state.isSportUpdate} placeholder="Sport Type" style={{ width: 150 }}
                                                onChange={this.handleMenuClick.bind(this)}
                                            >
                                                {
                                                    this.state.sportTypeData.map((x, index) => {
                                                        return (
                                                            <Option value={x.name} key={index} >{x.name}</Option>
                                                        )
                                                    })
                                                }
                                            </Select>,
                                        )
                                    }
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
        sportData: state.admin.sportData,
        totalCount: state.admin.sportCount,
    };
}
const Sport = Form.create({ name: 'sport' })(SportList);
export default connect(mapStateToProps, { getSport, addSport, removeSport, resetGamePoints })(Sport);
