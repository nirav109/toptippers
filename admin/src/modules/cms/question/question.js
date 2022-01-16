import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin, Select, Switch } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getQuestion, getTopic, removeQuestion, addQuestion } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

class QuestionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            topicData: [],
            questionData: [],
            topicId: '',
            questionId: '',
            isQuestionUpdate: false,
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
        this.props.getQuestion(obj);
        this.props.getTopic(obj);
    }

    showModal = (id, question, answer, topic) => {
        this.setState({
            visible: true,
            questionId: id,
            topicId: topic._id
        });
        if (id !== "") {
            this.props.form.setFieldsValue({ question: question, answer: answer, topic: topic._id })
        } else {
            this.props.form.resetFields();
        }

    };

    handleMenuClick(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            topicId: value
        });
    }

    handleOk = () => {
        this.props.form.validateFields((err, values) => {

            if (!err) {
                this.setState({ visible: false });
                let obj = {
                    questionId: this.state.questionId,
                    question: values.question,
                    answer: values.answer,
                    topicId: this.state.topicId
                }
                this.props.addQuestion(obj);

            }
        });
    };


    handleCancel = () => {
        this.setState({ visible: false });
    };

    showConfirm(questionId) {
        let self = this;
        let obj = {
            questionId: questionId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.props.removeQuestion(obj)
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
        this.props.getQuestion(obj)
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
        this.props.getQuestion(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.questionData;
        this.setState({ questionData: data, totalRecord: nextProps.totalCount, loading: false })
        let topicdata = nextProps.topicData;
        this.setState({ topicData: topicdata, loading: false })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const topic = state.topicData.map((x, index) =>
            <Option value={x._id}>{x.topicname}</Option>
        );

        const question = state.questionData.map((x, index) => <tr key={index}>
            <td>{x.question}</td>
            <td>{x.answer}</td>
            <td>{x.topic.topicname}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.question, x.answer, x.topic)}><i className="fa fa-pencil"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="QUESTION"
                    subTitle=""
                    extra={[
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Question</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'question')} className="cursor-pointer">Question {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'answer')} className="cursor-pointer">Answer {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'topic.topicname')} className="cursor-pointer">Topic {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {question}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Question"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Question">
                                    {getFieldDecorator('question', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter Question' }],
                                    })(
                                        <Input placeholder="Question" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Answer">
                                    {getFieldDecorator('answer', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter Answer' }],
                                    })(
                                        <TextArea placeholder="Answer" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Select Topic">
                                    {getFieldDecorator('topic', {
                                        initialValues: ['topic'],
                                        rules: [{ required: true, whitespace: true, message: 'Please select topic' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleMenuClick.bind(this)}>
                                            {topic}
                                        </Select>
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
        questionData: state.admin.questionData,
        totalCount: state.admin.questionCount,
        topicData: state.admin.topicData
    };
}
const Question = Form.create({ name: 'question' })(QuestionList);
export default connect(mapStateToProps, { getQuestion, addQuestion, removeQuestion, getTopic })(Question);
