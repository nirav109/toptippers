import React, { Component } from "react";
import {
  Statistic,
  Card,
  Col,
  Row,
  DatePicker,
  Descriptions,
  Button,
  Modal,
  Form,
  Switch,
  Input,
  Pagination,
  Spin,
} from "antd";
import * as constant from "../../../actions/constant";
import CustomModal from "../../../components/common/CustomModal";
import tradeDown from "../../../img/trending-down.png";
import tradeUp from "../../../img/trending-up.png";
import { connect } from "react-redux";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
const { confirm } = Modal;
const data = [
  {
    name: "10/12/2019",
    AFL: 55,
    NRL: 45,
  },
  {
    name: "11/12/2019",
    AFL: 65,
    NRL: 30,
  },
  {
    name: "12/12/2019",
    AFL: 30,
    NRL: 45,
  },
];

const { RangePicker } = DatePicker;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userCount: 0,
      sportCount: 0,
      competitionCount: 0,
      currentPage: 0,
      sortValue: "",
      sortOrder: "",
      visible: false,
      modelVisible: false,
      isTesting: false,
      currentDate: "",
      settingData: {},
      newSeason: false,
      sportData: [],
      seasonData: [],
      loading: true,
      viewModalVisible: false,
      viewSeasonData: "",
      seasonCount: 0,
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    
  }



  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let obj = {
          settingId: this.state.settingData._id,
          currentDate: values.date,
          isTesting: this.state.isTesting,
        };
        this.props.addSetting(obj);
      }
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isTesting: this.state.settingData.isTesting,
      currentDate: this.state.settingData.currentDate,
    });
  };

  onTestingChange = (checked) => {
    console.log(`switch to ${checked}`);
    this.setState({
      isTesting: checked,
    });
  };


  disabledDate = (current) => {
    return current < moment(this.state.currentDate, "YYYY-MM-DD");
  };



  render() {
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card hoverable className="mb-4">
                  <Statistic
                    title="Total Users"
                    value={this.state.userCount}
                    precision={0}
                    valueStyle={{ color: "#F9897F" }}
                    prefix={<img alt="trade" src={tradeUp} />}
                  // suffix="%"
                  />
                </Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card hoverable className="mb-4">
                  <Statistic
                    title="Total Sports"
                    value={this.state.sportCount}
                    precision={0}
                    valueStyle={{ color: "#8884d8" }}
                    prefix={<img alt="trade" src={tradeUp} />}
                  // suffix="%"
                  />
                </Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card hoverable className="mb-4">
                  <Statistic
                    title="Total Competitions"
                    value={this.state.competitionCount}
                    precision={0}
                    valueStyle={{ color: "#82ca9d" }}
                    prefix={<img alt="trade" src={tradeUp} />}
                  // suffix="%"
                  />
                </Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card hoverable className="mb-4">
                  <Statistic
                    title="Total Season"
                    value={this.state.SeasonCount}
                    precision={0}
                    valueStyle={{ color: "#82ca9d" }}
                    prefix={<img alt="trade" src={tradeUp} />}
                  // suffix="%"
                  />
                </Card>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* <Col className="gutter-row" span={8}>
              <div className="gutter-box">
                <Card hoverable className="mb-4" >
                  <Descriptions title={"Testing (isActive: " + this.state.settingData.isTesting + ")"} layout="vertical">
                    <Descriptions.Item label="Current date">{new Date(this.state.settingData.currentDate).toDateString()}</Descriptions.Item>
                  </Descriptions>
                  <Button type="primary" onClick={this.showModal.bind(this)}>Update</Button>

                  <CustomModal
                    handleCancel={this.handleCancel}
                    handleOk={this.handleOk}
                    visible={this.state.visible}
                    title="Update Testing"
                    backBtnText="Cancel"
                    submitBtnText="Submit">
                    <Form {...layout}>
                      <Form.Item label="Date">
                        {getFieldDecorator('date', {
                          initialValue: moment(new Date(this.state.settingData.currentDate), 'YYYY/MM/DD'),
                          rules: [{ required: true, message: 'Please enter date' }],
                        })(
                          <DatePicker disabledDate={this.disabledDate} placeholder="Date" />
                        )}
                      </Form.Item>
                      <Form.Item label="Testing Mode">

                        <Switch checked={this.state.isTesting} onChange={this.onTestingChange} />

                      </Form.Item>
                    </Form>
                  </CustomModal>

                </Card>
              </div>
            </Col> */}
            {/* <Col className="gutter-row" span={8}>
              <div className="gutter-box">
                <Card hoverable className="mb-4">
                  <Descriptions layout="vertical">
                    <Descriptions.Item label="WARNING">
                      Clicking this button should only be done when you want to
                      create a new season. The season data will be lost
                    </Descriptions.Item>
                  </Descriptions>
                  <Button
                    type="primary"
                    onClick={this.showSessionConfirm.bind(this)}
                  >
                    Start new season
                  </Button>
                </Card>
              </div>
            </Col> */}
          </Row>

          <CustomModal
            handleCancel={this.onCancel}
            handleOk={this.onDone}
            visible={this.state.modelVisible}
            title="New Season"
            backBtnText="Back"
            submitBtnText="Submit"
          >
            <Form className="sport-form l_hgt0">
              <Form.Item label="Season Name">
                {getFieldDecorator("seasonname", {
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: "Please enter Season Name",
                    },
                  ],
                })(<Input placeholder="Season Name" />)}
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
            </Form>
          </CustomModal>

          {/*
    <Row>
    <Col lg={24} md={24} xs={24}>
      <Card extra={<MonthPicker defaultValue={moment(new Date(), 'YYYY-MM')} allowClear={false} placeholder="Select month"/>}>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              width={800}
              height={400}
              data={data}
              margin={{
                top: 10, right: 30, left: 0, bottom: 0,
              }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="AFL" fill="#F9897F" />
              <Bar dataKey="NRL"fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </Col>
  </Row>
   */}


        </Row>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}
const Setting = Form.create({ name: "setting" })(Dashboard);
export default connect(mapStateToProps, {
})(Setting);
