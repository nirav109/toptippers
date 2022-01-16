import React from 'react';
import { Switch, Pagination, Input, Modal, PageHeader, Button, Form, Upload, Table, Divider, Icon } from 'antd';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import * as constant from '../../actions/constant';
import { getAllUsers, deleteUser, deActivateUser, addUser, verifyUser, sendMessage, deleteUsers } from '../user/actions/userActions';
import CustomModal from '../../components/common/CustomModal';
import { getBase64 } from '../../actions/constant';
import { debug } from 'request';
import toastr from 'toastr';
import TextArea from 'antd/lib/input/TextArea';


const { confirm } = Modal;


class Messaging extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      totalRecord: 0,
      search_string: '',
      userData: [],
      sortValue: '',
      sortOrder: '', //asc
      visible: false,
      imageUrl: '',
      fileObj: '',
      selectedRowKeys: [], // Check here to configure the default column
      selectedRows: [],
      selectedUserId: "",
      isMultiple: false,
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    let obj = {
      search_string: this.state.search_string,
      page: this.state.currentPage,
      sortValue: this.state.sortValue,
      sortOrder: this.state.sortOrder
    }
    this.props.getAllUsers(obj);
  }



  showConfirm(userId, isMultiple) {
    let self = this;

    if (isMultiple) {
      if (this.state.selectedRows.length > 0) {
        let data = {
          users: []
        }
        this.state.selectedRows.forEach(selectedRow => {
          data.users.push(selectedRow._id)
        })
        confirm({
          title: constant.DELETE_RECORD,
          content: '',
          onOk() { self.props.deleteUsers(data) },
        });
      } else {
        toastr.warning("Please select user");
      }
    } else {
      let obj = {
        userId: userId
      }
      confirm({
        title: constant.DELETE_RECORD,
        content: '',
        onOk() { self.props.deleteUser(obj) },
      });
    }

  }

  componentWillReceiveProps(nextProps) {
    let data = nextProps.userData;
    this.setState({ userData: data, totalRecord: nextProps.totalCount, loading: false })
  }
  showModal = (id, isMultiple) => {
    this.setState({
      visible: true,
      isMultiple: isMultiple,
      selectedUserId: id
    });
    this.props.form.setFieldsValue({ messageTitle: "", messageDescription: "" })
  };

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let data = {
          messageTitle: values.messageTitle,
          messageDescription: values.messageDescription,
          users: []
        }
        if (this.state.isMultiple) {
          if (this.state.selectedRows.length > 0) {
            this.state.selectedRows.forEach(selectedRow => {
              data.users.push(selectedRow._id)
            })
            this.props.sendMessage(data)

          } else {
            toastr.warning("Please select user");
          }
        } else {
          data.users.push(this.state.selectedUserId);
          this.props.sendMessage(data)

        }
        this.setState({ visible: false, isMultiple: false });
      }
    });
  };

  handleCancel = () => {
    this.setState({ visible: false, isMultiple: false });
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  };


  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        text
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let state = this.state;

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortDirections: ['descend', 'ascend'],
        ...this.getColumnSearchProps('name'),

      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: (a, b) => a.email.length - b.email.length,
        sortDirections: ['descend', 'ascend'],
        ...this.getColumnSearchProps('email'),

      },
      {
        title: 'Action',
        dataIndex: 'action',
        render: (text, record) => (
          <span style={{ color: 'blue' }}>
            <a onClick={this.showModal.bind(this, record._id, false)}>Send Message  </a>
            {/* <Divider type="vertical" />
                  {record.rolename=="user"?<a onClick={this.showConfirm.bind(this, record._id, false)}>Delete</a>:null} */}
          </span>
        ),
      },
    ];
    const data = [];
    state.userData.map((x, index) => {
      if (x.role.rolename == 'user' || x.role.rolename == "kingbot") {
        data.push({
          _id: x._id,
          key: index,
          name: x.name,
          email: x.email,
          rolename: x.role.rolename
        });

      }
    });
    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: 'all-data',
          text: 'Select All Data',
          onSelect: () => {
            this.setState({
              selectedRowKeys: [...Array(this.state.userData.length).keys()], // 0...45
            });
          },
        },
      ],
    };

    const hasSelected = selectedRowKeys.length > 0;

    return (
      <div className="box box-default mb-4">
        <PageHeader
          title="USERS"
          subTitle=""
          extra={[
            <Button onClick={this.showModal.bind(this, "", true)} type="primary">
              Send Message
            </Button>,
            //   <Button onClick={this.showConfirm.bind(this, "", true)} type="primary">
            //   Delete Selected User
            // </Button>


          ]}
        />

        <div className="box-body">
          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
          <CustomModal
            handleCancel={this.handleCancel}
            handleOk={this.handleOk}
            visible={this.state.visible}
            title="User"
            backBtnText="Back"
            submitBtnText="Submit">

            <Form className="team-form l_hgt0">

              <Form.Item label="Message Title">
                {getFieldDecorator('messageTitle', {
                  rules: [{ required: true, whitespace: true, message: 'Please enter title' }],
                })(
                  <Input placeholder="Title" />,
                )}
              </Form.Item>
              <Form.Item label="Message Description">
                {getFieldDecorator('messageDescription', {
                  rules: [{ required: true, whitespace: true, message: 'Please enter description' }],
                })(
                  <TextArea placeholder="Description" />,
                )}
              </Form.Item>
            </Form>
          </CustomModal>
        </div>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    userData: state.user.userData,
    totalCount: state.user.totalCount,

  };
}
const Messagings = Form.create({ name: 'messaging' })(Messaging);
export default connect(mapStateToProps, { getAllUsers, deleteUser, deActivateUser, addUser, verifyUser, sendMessage, deleteUsers })(Messagings);

