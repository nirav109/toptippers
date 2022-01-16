import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getTopic, removeTopic, addTopic } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;

class TopicList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            topicData: [],
            topicId: '',
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
        this.props.getTopic(obj)
    }

    showModal = (id, name) => {
        this.setState({
            visible: true,
            topicId: id
        });
        if(id!==""){
            this.props.form.setFieldsValue({ topicname: name})
        }
        
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let obj = {
                topicname: values.topicname,
                topicId: this.state.topicId
            }
            if (!err) {
                this.setState({ visible: false });
                this.props.addTopic(obj);
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

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
        this.props.getTopic(obj)
    }

    showConfirm(sportId) {
        let self = this;
        let obj = {
            topicId: sportId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.props.removeTopic(obj)
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
        this.props.getTopic(obj)
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
        this.props.getTopic(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.topicData;
        this.setState({ topicData: data, totalRecord: nextProps.totalCount, loading: false });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const topic = state.topicData.map((x, index) => <tr key={index}>
            <td>{x.topicname}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.topicname)}><i className="fa fa-pencil"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="TOPIC"
                    subTitle=""
                    extra={[
                        <Input placeholder="Search" onChange={this.searchString.bind(this)} key="search" style={{ width: 'auto' }} />,
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Topic</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'topicname')} className="cursor-pointer">Topic Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topic}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Topic"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Topic Name">
                                    {getFieldDecorator('topicname', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter topic' }],
                                    })(
                                        <Input placeholder="Topic" />,
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
        topicData: state.admin.topicData,
        totalCount: state.admin.topicCount
    };
}
const Topic = Form.create({ name: 'topic' })(TopicList);
export default connect(mapStateToProps, { getTopic, addTopic, removeTopic })(Topic);
