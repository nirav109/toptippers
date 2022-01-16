import React from 'react';
import { Pagination, Button, Modal, PageHeader, Form, Input, Spin, Select, Upload, Icon } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getAd, removeAd, addAd } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
const { confirm } = Modal;
const { Option } = Select;


class AdList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            adData: [],
            adId: '',
            selectedData: {},
            sortValue: '',
            sortOrder: '',
            selectMediaTypeData: [],
            selectedMediaType: '',
            fileList: [],
            loading: true
        };
    }

    componentDidMount() {
        this.setState({
            selectMediaTypeData: [
                { name: "image" },
                { name: "gif" },
                { name: "video" }
            ]
        });
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder
        }
        this.props.getAd(obj)
    }

    showModal = (id, name, type, redirectUrl, mediaType, data) => {
        this.setState({
            visible: true,
            adId: id,
            selectedData: data
        });
        this.props.form.setFieldsValue({ name: name, type: type, redirectUrl: redirectUrl, mediaType: mediaType })
    };

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let obj = {
                name: values.name,
                type: values.type,
                redirectUrl: values.redirectUrl,
                mediaType: values.mediaType,
                adId: this.state.adId
            }

            let formData = new FormData();
            this.state.fileList.forEach(file => {
                formData.append('files', file);
            });
            formData.append("name", obj.name)
            formData.append("type", obj.type)
            formData.append("redirectUrl", obj.redirectUrl)
            formData.append("mediaType", obj.mediaType)
            formData.append("adId", obj.adId)
            if (!err) {
                this.setState({ visible: false, fileList: [] });
                this.props.addAd(formData)
            } else {
            }
        });
    };

    handleMediaChange = info => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.

        }
    };

    upload = file => {
    }

    handleBeforeUpload = file => {
        // this.setState(state => ({
        //     fileList: [...state.fileList, file]
        //   }));

        this.setState({ fileList: [] });
        this.setState({ fileList: [file] })
        return false;
    }

    handleCancel = () => {
        this.setState({ visible: false, fileList: [] });
    };

    showConfirm(adId) {
        let self = this;
        let obj = {
            adId: adId
        }
        confirm({
            title: constant.DELETE_RECORD,
            content: '',
            onOk() {
                self.props.removeAd(obj)
            },
            onCancel() { },
        });
    }

    handleMediaTypeSelect(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            selectedMediaType: value
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
        this.props.getAd(obj)
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
        this.props.getAd(obj)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.adData;
        this.setState({ adData: data, totalRecord: nextProps.totalCount, loading: false })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const sport = state.adData.map((x, index) => <tr key={index}>
            <td>{x.name}</td>
            <td>{x.type}</td>
            <td>{x.mediaType}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showModal.bind(this, x._id, x.name, x.type, x.redirectUrl, x.mediaType, x)}><i className="fa fa-pencil"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="AD"
                    subTitle=""
                    extra={[
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "", "", "", "")}>Add Ad</Button>,
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'name')} className="cursor-pointer">Name {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'type')} className="cursor-pointer">Type {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'mediaType')} className="cursor-pointer">Media Type {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
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
                            title={this.state.selectedData ? "Edit Ad" : "Add Ad"}
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form className="sport-form l_hgt0">
                                <Form.Item label="Name">
                                    {getFieldDecorator('name', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter name' }],
                                    })(
                                        <Input placeholder="name" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Type">
                                    {getFieldDecorator('type', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter type' }],
                                    })(
                                        <Input placeholder="Type" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Redirect Url">
                                    {getFieldDecorator('redirectUrl', {
                                        rules: [{ required: true, whitespace: true, message: 'Please enter redirect url' }],
                                    })(
                                        <Input placeholder="Redirect Url" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Select Media Type">
                                    {getFieldDecorator('mediaType', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select media type' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleMediaTypeSelect.bind(this)}>
                                            {this.state.selectMediaTypeData.map((x, index) =>
                                                <Option value={x.name}>{x.name}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Upload
                                    name="file"
                                    showUploadList={true}
                                    action={this.upload}
                                    showUploadList={this.state.fileList.length > 0 ? true : false}
                                    beforeUpload={this.handleBeforeUpload}
                                    onChange={this.handleMediaChange}>

                                    <Button
                                        disabled={this.state.fileList.length > 0}
                                    >
                                        <Icon type="upload" /> Click to Upload
                                    </Button>

                                </Upload>
                                {this.state.adId && this.state.fileList.length <= 0 ?
                                    <div class="ant-upload-list ant-upload-list-text">
                                        <div class="">
                                            <span>
                                                <div class="ant-upload-list-item ant-upload-list-item-undefined ant-upload-list-item-list-type-text">
                                                    <div class="ant-upload-list-item-info">
                                                        <span><i aria-label="icon: paper-clip" class="anticon anticon-paper-clip"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="paper-clip" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0 0 12.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0 0 12.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364 224.8 602.1A172.22 172.22 0 0 0 174 724.8c0 46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z"></path></svg></i>
                                                            <span class="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1" title="TopSport_Bnr_02.mp4">{this.state.selectedData.media}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                    </div> : null}
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
        adData: state.admin.adData,
        totalCount: state.admin.adCount
    };
}
const Ad = Form.create({ name: 'ad' })(AdList);
export default connect(mapStateToProps, { getAd, addAd, removeAd })(Ad);
