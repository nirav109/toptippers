import React, { Component } from "react";
import {
    Form,
    PageHeader,
    Button,
    Spin,
    Select,
    Row,
    Col,
    Card,
    Statistic,
} from "antd";
import { connect } from "react-redux";
import { getSeasonDetails, getRound } from "../../admin/actions/adminActions";
import autoBind from "react-autobind";

const { Option } = Select;

class seasonDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seasonDetails: "",
            loading: false,
            page: 0,
            imageUrl: "",
            visible: false,
            roundData: [],
        };
        autoBind(this);
    }

    componentDidMount() {
        let obj = {
            seasonId: this.props.match.params.seasonId,
        };
        console.log("obj-------------", obj);
        this.props.getSeasonDetails(obj);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            seasonDetails: nextProps.seasonDetails,
            loading: false,
        });
        let data = nextProps.roundData;
        this.setState({ roundData: data, loading: false })
    }

    handleMenuClick2(values) {
        // console.log("values isss", values);
        let obj = {
            "sportId": values
        }
        console.log("obj obj ", obj);
        this.props.getRound(obj)
        console.log("roundlist", this.state.roundData);

    }

    render() {
        let state = this.state;
        let season = state.seasonDetails ? state.seasonDetails : "";
        const { getFieldDecorator } = this.props.form;

        return (
            <>
                <div className="overflowBox">
                    <PageHeader title="SEASON PROFILE " subTitle="" />
                    <Spin spinning={this.state.loading} delay={500}>
                        <div className="box box-default mb-4">
                            {console.log(season)}
                            <Row>
                                <Col style={{ height: "10vh" }} span={24}>
                                    <Card style={{ border: "none" }} className="mb-4">
                                        <Statistic
                                            title="Season Name :-"
                                            value={season.seasonname}
                                            precision={0}
                                        // valueStyle={{ color: "#F9897F" }}
                                        // prefix={<img alt="trade" src={tradeUp} />}
                                        // suffix="%"
                                        />
                                    </Card>
                                </Col>
                                <Col style={{ height: "12vh" }} span={24}>
                                    <Card style={{ border: "none" }} className="mb-4">
                                        <div class="ant-statistic">
                                            <div class="ant-statistic-title">
                                                Season Sport List :-
                                            </div>
                                            <div class="ant-statistic-content">
                                                <Select
                                                    placeholder="Season"
                                                    style={{ width: 300 }}
                                                    onChange={this.handleMenuClick2.bind(this)}
                                                >
                                                    {season == ""
                                                        ? ""
                                                        : season.sport.map((x, index) => {
                                                            return (
                                                                <Option value={x._id}>{x.sportname}</Option>
                                                            );
                                                        })}
                                                </Select>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                                <Col style={{ height: "12vh" }} span={24}>
                                    <Card style={{ border: "none" }} className="mb-4">
                                        <div class="ant-statistic">
                                            <div class="ant-statistic-title">{console.log("round List", this.state.roundData)}
                                                Sport Round List :-
                                            </div>
                                            <div class="ant-statistic-content">
                                                <Select
                                                    placeholder="Season"
                                                    style={{ width: 300 }}
                                                // onChange={this.handleMenuClick2.bind(this)}
                                                >
                                                    {
                                                        this.state.roundData == "" ? '' : this.state.roundData.map((x, index) => {
                                                            return (
                                                                <Option value={x._id}>{x.roundname}</Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                                <Button style={{ marginLeft: "20px" }} type="primary">Add Round</Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </Spin>
                </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        seasonDetails: state.admin.seasonDetails,
        roundData: state.admin.roundData,

    };
}
const SeasonProfile = Form.create({ name: "setting" })(seasonDetail);
export default connect(mapStateToProps, {
    getSeasonDetails, getRound
})(SeasonProfile);
