import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getContent, addContent } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;
const { TextArea } = Input;

class ContentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            contentData: [],
            contentId: '',
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
        this.props.getContent(obj)
    }

    showModal = (id, content) => {
        this.setState({
            visible: true,
            contentId: id
        });
        if (id !== "") {
            this.props.form.setFieldsValue({ content: content })
        }

    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let obj = {
                content: values.content,
                contentId: this.state.contentId
            }
            if (!err) {
                this.setState({ visible: false });
                this.props.addContent(obj);
            } else {
            }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };


    changePage(page, pageSize) {
        this.setState({
            currentPage: page - 1,
        });
        let obj = {
            page: page - 1,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getContent(obj)
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
        this.props.getContent(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.contentData;
        this.setState({ contentData: data, totalRecord: nextProps.totalCount, loading: false });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const content = state.contentData.map((x, index) => <tr key={index}>
            <td>{x.contentType}</td>
            <td>{x.content}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.content)}><i className="fa fa-pencil"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="CONTENT"
                    subTitle=""
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'contenttype')} className="cursor-pointer">Type {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'content')} className="cursor-pointer">Content {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>

                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title=""
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Content">
                                    {getFieldDecorator('content', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter content' }],
                                    })(
                                        <TextArea placeholder="Topic" />,
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
        contentData: state.admin.contentData,
        totalCount: state.admin.contentCount
    };
}
const Content = Form.create({ name: 'content' })(ContentList);
export default connect(mapStateToProps, { getContent, addContent })(Content);
