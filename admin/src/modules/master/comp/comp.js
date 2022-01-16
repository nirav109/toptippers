import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getComp, resetCompUserGamePoints, resetAllCompUserGamePoints, removeComp } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;

class CompList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            compData: [],
            compId: '',
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
        this.props.getComp(obj)
    }

    showConfirm(compId) {
        let self = this;
        let obj = {
            compId: compId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.setState({ currentPage: 0 });
                self.props.removeComp(obj)
            },
            onCancel() { },
        });
    }

    showConfirmResetPoints(compId, sportId) {
        let self = this;
        let obj = {
            params: {
                compId: compId,
                sportId: sportId
            }
        }
        confirm({
            title: "Do you want to reset game points?",
            content: '',
            onOk() {
                self.props.resetCompUserGamePoints(obj)
            },
            onCancel() { },
        });
    }

    showConfirmResetPointsAll(sportId) {
        let self = this;
        let obj = { params: {} }
        confirm({
            title: "Do you want to reset all competitions game points?",
            content: '',
            onOk() {
                self.props.resetAllCompUserGamePoints(obj)
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
        this.props.getComp(obj)
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
        this.props.getComp(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.compData;
        this.setState({ compData: data, totalRecord: nextProps.totalCount, loading: false })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const comp = state.compData.map((x, index) => <tr key={index}>
            <td>{x.competitionname}</td>
            <td>{x.sport.sportname}</td>
            <td>{x.totalCount}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirmResetPoints.bind(this, x._id, x.sport._id)}><i className="fa fa-anchor"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>

            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="COMPETITION"
                    subTitle=""
                    extra={[
                        <Button key="1" type="primary" onClick={this.showConfirmResetPointsAll.bind(this, "")}>Reset All</Button>,

                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'competitionname')} className="cursor-pointer">Competition Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col">Sport</th>
                                    <th scope="col">Total Joined User</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comp}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} defaultCurrent={this.state.currentPage} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                    </div>
                </Spin>
            </div>
        </>
        );
    }

}
function mapStateToProps(state) {
    return {
        compData: state.admin.compData,
        totalCount: state.admin.compCount
    };
}
const Comp = Form.create({ name: 'comp' })(CompList);
export default connect(mapStateToProps, { getComp, resetCompUserGamePoints, resetAllCompUserGamePoints, removeComp })(Comp);
