import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getBonus, removeBonus, addBonus } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;

class BonusList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            bonusData: [],
            bonusId: '',
            sortValue: '',
            sortOrder: '',
            loading: true
        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getBonus(obj)
    }

    showModal = (id, name, description) => {
        this.setState({
            visible: true,
            bonusId: id
        });
        this.props.form.setFieldsValue({ bonusname: name, description: description })
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let obj = {
                bonusname: values.bonusname,
                description: values.description,
                // bonusId: this.state.bonusId
            }
            if (!err) {
                this.setState({ visible: false });
                this.props.addBonus(obj)
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    showConfirm(bonusId) {
        let self = this;
        let obj = {
            bonusId: bonusId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.props.removeBonus(obj)
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
        this.props.getBonus(obj)
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
        this.props.getBonus(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.bonusData;
        this.setState({ bonusData: data, totalRecord: nextProps.totalCount, loading: false })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const bonus = state.bonusData.map((x, index) => <tr key={index}>
            <td>{x.bonusname}</td>
            <td>{x.description}</td>
            <td>
                {/* <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.bonusname, x.description)}><i className="fa fa-pencil"></i></Button> */}
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="BONUS"
                    subTitle=""
                    extra={[
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Bonus</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'bonusname')} className="cursor-pointer">Bonus Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'bonusname')} className="cursor-pointer">Description {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>                                   
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bonus}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Bonus"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="bonus-form">
                                <Form.Item label="Bonus Name">
                                    {getFieldDecorator('bonusname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter bonus name' }],
                                    })(
                                        <Input placeholder="Bonus" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Description">
                                    {getFieldDecorator('description', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter description' }],
                                    })(
                                        <Input placeholder="Description" />,
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
        bonusData: state.admin.bonusData,
        totalCount: state.admin.bonusCount
    };
}
const Bonus = Form.create({ name: 'bonus' })(BonusList);
export default connect(mapStateToProps, { getBonus, addBonus, removeBonus })(Bonus);
