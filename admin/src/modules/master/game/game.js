import React from 'react';
import { Pagination, Button, Radio, Modal, PageHeader, Form, Input, Spin, Select, DatePicker, TimePicker, Descriptions, Result } from 'antd';
import CustomModal from '../../../components/common/CustomModal';
import * as constant from '../../../actions/constant';
import { getRound, getSport, removeGame, addGame, getTeam, getGame, updateGame, updateGameSeason, autoTipping, sendGameStartNotification } from '../../admin/actions/adminActions';
import { connect } from 'react-redux';
import moment from 'moment';
import { any } from 'prop-types';
import toastr from 'toastr';
import sport from '../sport/sport';
const { confirm } = Modal;
const { Option } = Select;

class GameList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            totalRecord: 0,
            visible: false,
            viewModalVisible: false,
            resultModalVisible: false,
            editModalVisible: false,
            isDataNotAvailable: false,
            sportData: [],
            gameData: [],
            roundData: [],
            selectRoundData: [],
            teamData: [],
            homeTeamData: [],
            selectHomeTeamData: [],
            awayTeamData: [],
            selectAwayTeamData: [],
            selectWinnerData: [{ id: 1, name: 'Home' }, { id: 2, name: 'Away' }, { id: 3, name: 'Draw' }],
            selectWinnerData1: [{ id: 1, name: 'Home' }, { id: 2, name: 'Away' }],
            sportId: '',
            roundId: '',
            homeTeamId: '',
            awayTeamId: '',
            sortValue: '',
            sortOrder: '',
            loading: true,
            roundOption: '',
            viewGameData: '',
            viewHomeTeamData: '',
            viewAwayTeamData: '',
            viewRoundData: '',
            viewSportData: '',
            winner: '',
            editGameDate: '',
            editGameTime: '',
            editGameState: '',
            selectedSeason: 'current',
            sportType: '',
        };
    }

    componentDidMount() {
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            season: 'current'
        }
        let selection_obj = {
            count: 1000,
            season: 'current'
        }
        this.props.getSport(selection_obj);
        this.props.getRound(selection_obj);
        this.props.getTeam(selection_obj);
        this.props.getGame(obj);
    }

    showModal = (id, sport, round, date, time, points, homeTeamPoints, awayTeamPoints, homeSeasonPoints, awaySeasonPoints, homeTeam, awayTeam) => {
        this.setState({
            visible: true,
            sportId: id
        });
        if (id !== "") {
            var roundData = this.state.roundData;
            roundData = roundData.filter(round => round.sport._id == sport._id);
            var teamData = this.state.teamData;
            var homeTeamData = teamData.filter(team => team.sport._id == sport._id);
            var awayTeamData = teamData.filter(team => team.sport._id == sport._id);
            this.setState({
                sportId: sport._id,
                selectRoundData: roundData,
                homeTeamData: homeTeamData,
                selectHomeTeamData: homeTeamData,
                awayTeamData: awayTeamData,
                selectAwayTeamData: awayTeamData
            });
            var mydate = this.formatDate(date);

            this.props.form.setFieldsValue({ sport: sport._id, round: round._id, date: mydate, points: points, hometeampoints: homeTeamPoints, awayteampoints: awayTeamPoints, homeseasonpoints: homeSeasonPoints, awayseasonpoints: awaySeasonPoints, hometeam: homeTeam._id, awayteam: awayTeam._id })
        } else {
            this.props.form.resetFields();
        }
    };

    autoTipping = () => {
        this.props.autoTipping();
    }

    sendGameStartNotification = (gameId) => {
        let obj = {
            gameId: gameId,
            selectedSeason: this.state.selectedSeason
        }
        this.props.sendGameStartNotification(obj);
    }

    showViewModal = (data) => {
        this.setState({
            viewModalVisible: true,
            viewGameData: data,
            viewHomeTeamData: data.homeTeam,
            viewAwayTeamData: data.awayTeam,
            viewRoundData: data.round,
            viewSportData: data.sport
        });
    };

    showResultModal = (data) => {

        if (data.winningTeam == "") {
            this.setState({
                resultModalVisible: true,
                viewGameData: data,
                viewSportData: data.sport
            });
        } else {
            toastr.info("Winner already declared")
        }


    };

    showEditModal = (data) => {
        // console.log(data.sport.type);
        this.setState({
            sportType: data.sport.type
        })


        this.props.form.resetFields();
        var roundData = this.state.roundData;
        roundData = roundData.filter(round => round.sport._id == data.sport._id);
        var teamData = this.state.teamData;
        var homeTeamData = teamData.filter(team => team.sport._id == data.sport._id);
        var awayTeamData = teamData.filter(team => team.sport._id == data.sport._id);
        var selectAwayTeamData = awayTeamData.filter(team => team._id !== data.homeTeam._id);
        var selectHomeTeamData = homeTeamData.filter(team => team._id !== data.awayTeam._id);
        this.setState({
            editModalVisible: true,
            viewGameData: data,
            viewSportData: data.sport,
            editGameDate: data.gameDate,
            editGameTime: new Date(data.gameTime),
            selectRoundData: roundData,
            homeTeamData: homeTeamData,
            selectHomeTeamData: selectHomeTeamData,
            awayTeamData: awayTeamData,
            selectAwayTeamData: selectAwayTeamData,
            editGameState: data.gameState
        });

        this.props.form.setFieldsValue({
            esport: data.sport._id,
            eround: data.round._id,
            epoints: String(data.points),
            ehometeampoints: String(data.homeTeamPoints),
            eawayteampoints: String(data.awayTeamPoints),
            ehomeseasonpoints: String(data.homeSeasonPoints),
            eawayseasonpoints: String(data.awaySeasonPoints),
            eEventId: data.eventId,
            ehometeam: data.homeTeam._id,
            eawayteam: data.awayTeam._id,
            ewinner: data.winningTeam
        });
        this.setState({
            winner: data.winningTeam
        });
    };

    handleSportSelect(value) {
        console.log("value", value)
        console.log("sportid :", value);
        var roundData = this.state.roundData;
        roundData = roundData.filter(round => round.sport._id == value);
        var teamData = this.state.teamData;
        var homeTeamData = teamData.filter(team => team.sport._id == value);
        var awayTeamData = teamData.filter(team => team.sport._id == value);

        this.props.form.setFieldsValue({
            eround: null,
            round: null,
            ehometeam: null,
            hometeam: null,
            eawayteam: null,
            awayteam: null
        })

        this.setState({
            sportId: value,
            selectRoundData: roundData,
            homeTeamData: homeTeamData,
            selectHomeTeamData: homeTeamData,
            awayTeamData: awayTeamData,
            selectAwayTeamData: awayTeamData
        });

    }

    handleRoundSelect(value) {
        console.log("value", value)
        let thiss = this;
        thiss.setState({
            roundId: value
        });
    }

    handleHomeTeamSelect(value) {
        console.log("value", value)
        var awayTeamData = this.state.awayTeamData;
        awayTeamData = awayTeamData.filter(team => team._id !== value);
        this.setState({
            homeTeamId: value,
            selectAwayTeamData: awayTeamData
        });
    }

    handleAwayTeamSelect(value) {
        console.log("value", value)
        var homeTeamData = this.state.homeTeamData;
        homeTeamData = homeTeamData.filter(team => team._id !== value);
        this.setState({
            awayTeamId: value,
            selectHomeTeamData: homeTeamData
        });
    }

    handleWinnerSelect(value) {
        console.log("value", value)
        this.setState({
            winner: value
        });
    }

    handleSeasonRadio(data) {
        console.log("season_radio: " + data.target.value);
        this.setState({
            selectedSeason: data.target.value
        })
        let obj = {
            page: this.state.currentPage,
            sortValue: this.state.sortValue,
            sortOrder: this.state.sortOrder,
            season: data.target.value
        }
        this.props.getGame(obj);
    }

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let gameTime = new Date(values.time);
            let gameDateTime = new Date(values.date);
            gameDateTime.setHours(gameTime.getHours(), gameTime.getMinutes(), '00');
            let obj = {
                sport: this.state.sportId,
                date: gameDateTime,
                time: gameDateTime,
                gameState: 'open',
                round: this.state.roundId,
                points: parseFloat(values.points),
                homeTeamPoints: parseFloat(values.hometeampoints),
                awayTeamPoints: parseFloat(values.awayteampoints),
                homeSeasonPoints: parseFloat(values.homeseasonpoints),
                awaySeasonPoints: parseFloat(values.awayseasonpoints),
                eventId: values.eventId,
                homeTeam: this.state.homeTeamId,
                awayTeam: this.state.awayTeamId,
                winningTeam: '',
                season: 'current',
                selectedSeason: this.state.selectedSeason
            }

            if (!(err.sport && err.round && err.date && err.time && err.hometeam && err.awayteam)) {
                var round = this.state.roundData.find(round => round._id == this.state.roundId);
                if (this.isDateBetween(round.startDate, round.endDate, values.date)) {
                    this.setState({ visible: false, currentPage: 0 });
                    this.props.addGame(obj)
                } else {
                    toastr.warning("Please select date between round date");
                }

            } else {
            }
        });
    };

    isDateBetween(startDate, endDate, checkDate) {
        var from = new Date(startDate);  // -1 because months are from 0 to 11
        from.setHours(0, 0, 0, 0);
        var to = new Date(endDate);
        to.setHours(23, 55, 0, 0);
        var check = new Date(checkDate);

        if (check >= from && check <= to) {
            return true;
        } else {
            return false;
        }

    }

    handleViewModalOk = () => {
        this.setState({ viewModalVisible: false });
    }

    handleResultModalOk = () => {
        this.setState({ resultModalVisible: false, currentPage: 0 });
        let obj = {
            gameId: this.state.viewGameData._id,
            sportId: this.state.viewSportData._id,
            gameState: 'finished',
            winningTeam: this.state.winner,
            selectedSeason: this.state.selectedSeason
        }
        this.props.addGame(obj);
    }

    handleEditModalOk = () => {
        this.props.form.validateFields((err, values) => {
            let gameTime = new Date(this.state.editGameTime);
            let gameDateTime = new Date(this.state.editGameDate);
            gameDateTime.setHours(gameTime.getHours(), gameTime.getMinutes(), '00');
            var gameState = this.state.editGameState;
            if (this.state.winner !== "") {
                gameState = "finished";
            }
            let obj = {
                gameId: this.state.viewGameData._id,
                gameDate: gameDateTime,
                gameTime: gameDateTime,
                sport: values.esport,
                round: values.eround,
                points: parseFloat(values.epoints),
                homeTeamPoints: parseFloat(values.ehometeampoints),
                awayTeamPoints: parseFloat(values.eawayteampoints),
                homeSeasonPoints: parseFloat(values.ehomeseasonpoints),
                awaySeasonPoints: parseFloat(values.eawayseasonpoints),
                eventId: values.eEventId,
                homeTeam: values.ehometeam,
                awayTeam: values.eawayteam,
                winningTeam: this.state.winner,
                gameState: gameState,
                selectedSeason: this.state.selectedSeason
            }
            if (!(err.esport && err.eround && err.edate && err.ehometeampoints && err.eawayteampoints && err.etime && err.ehometeam && err.eawayteam)) {
                var round = this.state.roundData.find(round => round._id == values.eround);
                if (this.isDateBetween(round.startDate, round.endDate, this.state.editGameDate)) {
                    if (this.state.winner !== "" && this.state.editGameState == "open") {
                        toastr.warning("Game is not started yet");
                    } else {
                        this.setState({ editModalVisible: false, currentPage: 0 });
                        this.props.updateGame(obj);
                    }

                } else {
                    toastr.warning("Please select date between round date");
                }
            }
        });



    }

    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleViewModalCancel = () => {
        this.setState({ viewModalVisible: false });
    }

    handleResultModalCancel = () => {
        this.setState({ resultModalVisible: false });
    }

    handleEditModalCancel = () => {
        this.setState({ editModalVisible: false });
    }

    onEditDateChange = (date, dateString) => {
        console.log(date, dateString);
        this.setState({
            editGameDate: new Date(dateString),
        });
    }

    onEditTimeChange = (time, timeString) => {
        console.log(time, timeString);
        this.setState({
            editGameTime: new Date(time._d),
        });
    }

    showConfirm(gameId) {
        let self = this;
        let obj = {
            gameId: gameId,
            selectedSeason: this.state.selectedSeason
        }
        confirm({
            title: "Are you sure you want to delete this game. If these teams already played, then this may cause issues. If you need to make a change to this game, then edit it (don't delete it)",
            content: '',
            onOk() {
                self.setState({ currentPage: 0 });
                self.props.removeGame(obj)
            },
            onCancel() { },
        });
    }

    showGameStateConfirm(gameId) {
        let self = this;
        let obj = {
            gameId: gameId,
            gameState: "started",
            selectedSeason: this.state.selectedSeason
        }
        confirm({
            title: "Are you sure you want to start this game",
            content: '',
            onOk() {
                self.setState({ currentPage: 0 });
                self.props.addGame(obj)
            },
            onCancel() { },
        });
    }

    handlePastSeason() {
        let self = this;
        let obj = {
            selectedSeason: this.state.selectedSeason
        }

        confirm({
            title: "Do you really want to send all current game to past?",
            content: '',
            onOk() {
                self.props.updateGameSeason(obj)
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
            sortOrder: this.state.sortOrder,
            season: this.state.selectedSeason
        }
        this.props.getGame(obj)
    }

    sortData(sortVal) {
        this.setState({
            sortOrder: this.state.sortOrder === -1 ? 1 : -1
        });
        let obj = {
            page: this.state.currentPage,
            sortValue: sortVal,
            sortOrder: this.state.sortOrder === -1 ? 1 : -1,
            selectedSeason: this.state.selectedSeason
        }
        this.props.getGame(obj)
    }


    componentWillReceiveProps(nextProps) {
        let data = nextProps.roundData;
        this.setState({ roundData: data, totalRecord: nextProps.totalCount, loading: false })
        let sportdata = nextProps.sportData;
        this.setState({ sportData: sportdata, loading: false })
        let teamdata = nextProps.teamData;
        this.setState({ teamData: teamdata, loading: false })
        let gamedata = nextProps.gameData;
        this.setState({ gameData: gamedata, loading: false })
        if (nextProps.gameData.length <= 0) {
            this.state.isDataNotAvailable = true;
        } else {
            this.state.isDataNotAvailable = false;
        }
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('/');
    }


    render() {
        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
        const { getFieldDecorator } = this.props.form;
        let state = this.state;

        const sport = state.sportData.map((x, index) =>
            <Option value={x._id}>{x.sportname}</Option>
        );

        this.state.roundOption = this.state.roundData.map((x, index) =>
            <Option value={x._id}>{x.roundname}</Option>
        );

        const team = state.teamData.map((x, index) =>
            <Option value={x._id}>{x.teamname}</Option>
        );

        const game = state.gameData.map((x, index) => <tr key={index}>
            <td>{x.sport.sportname}</td>
            <td>{x.round.roundno}</td>
            <td>{x.round.roundname}</td>
            <td>{x.homeTeam.teamname}</td>
            <td>{x.awayTeam.teamname}</td>
            <td>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showViewModal.bind(this, x)}><i className="fa fa-eye"></i></Button>
                {/*<Button className="btn btn-info btn-sm mr-2" onClick={this.showResultModal.bind(this, x)}><i className="fa fa-check-circle"></i></Button>*/}
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showConfirm.bind(this, x._id)}><i className="fa fa-trash"></i></Button>
                <Button className="btn btn-info btn-sm mr-2" onClick={this.showEditModal.bind(this, x)}><i className="fa fa-pencil"></i></Button>
                {x.gameState == "open" ? <Button className="btn btn-info btn-sm mr-2" onClick={this.sendGameStartNotification.bind(this, x._id)}><i className="fa fa-telegram"></i></Button> : null}
                {x.gameState == "open" ? <Button className="btn btn-info btn-sm mr-2" onClick={this.showGameStateConfirm.bind(this, x._id)}><i className="fa fa-hourglass-start"></i></Button> : null}

            </td>
        </tr>);

        return (<>
            <div className="box box-default mb-4">
                <PageHeader
                    title="Game"
                    subTitle=""
                    extra={[
                        // <Radio.Group defaultValue="current" buttonStyle="solid" onChange={this.handleSeasonRadio.bind(this)} style={{marginRight: '22vw'}}>
                        //     <Radio.Button value="current">Current Season</Radio.Button>
                        //     <Radio.Button value="past">Past Season</Radio.Button>
                        // </Radio.Group>,
                        <Button key="1" type="primary" onClick={this.showModal.bind(this, "", "", "")}>Add Game</Button>
                        // <Button key="1" type="primary" onClick={this.autoTipping.bind(this)}>Auto Tipping</Button>
                    ]}
                />
                <Spin spinning={this.state.loading} delay={500}>
                    <div className="box-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={this.sortData.bind(this, 'sport.sportname')} className="cursor-pointer">Sports {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'round.roundno')} className="cursor-pointer">Round No {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'round.roundname')} className="cursor-pointer">Round {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'hometeam.teamname')} className="cursor-pointer">Home Team {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col" onClick={this.sortData.bind(this, 'awayteam.teamname')} className="cursor-pointer">Away Team {this.state.sortOrder === 1 ? <i className="fa fa-sort-amount-asc" aria-hidden="true"></i> : <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {game}
                            </tbody>
                        </table>
                        <Pagination style={{ 'textAlign': 'right' }} pageSize={5} current={this.state.currentPage + 1} defaultCurrent={this.state.currentPage + 1} total={this.state.totalRecord ? this.state.totalRecord : 1} onChange={this.changePage.bind(this)} />
                        {/*this.state.selectedSeason=="current" && this.state.gameData.length>0?
                        <Button type="primary" style={{'marginLeft': '83%', 'marginTop': '10px'}} onClick={this.handlePastSeason.bind(this)}>Send to Past Season</Button>
                :null*/}
                        <CustomModal
                            handleCancel={this.handleCancel}
                            handleOk={this.handleOk}
                            visible={this.state.visible}
                            title="Add Game"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form {...layout}>
                                <Form.Item label="Select Sports">
                                    {getFieldDecorator('sport', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select sports' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleSportSelect.bind(this)}>
                                            {sport}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Select Round">
                                    {getFieldDecorator('round', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select round' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleRoundSelect.bind(this)}>
                                            {this.state.selectRoundData.map((x, index) =>
                                                <Option value={x._id}>{x.roundname}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Timezone">
                                    {getFieldDecorator('timezone', {
                                        initialValue: 'Australia/Sydney',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter timezone' }],
                                    })(
                                        <Input placeholder="Timezone" disabled />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Date">
                                    {getFieldDecorator('date', {
                                        rules: [{ required: true, message: 'Please enter date' }],
                                    })(
                                        <DatePicker placeholder="Date" />
                                    )}
                                </Form.Item>
                                <Form.Item label="Time">
                                    {getFieldDecorator('time', {
                                        rules: [{ required: true, message: 'Please enter time' }],
                                    })(
                                        <TimePicker placeholder="Time" format={'HH:mm'} />
                                    )}
                                </Form.Item>
                                <Form.Item label="Points">
                                    {getFieldDecorator('points', {
                                        initialValue: '2',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" disabled />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Home Team Points">
                                    {getFieldDecorator('hometeampoints', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Away Team Points">
                                    {getFieldDecorator('awayteampoints', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Home Season Points">
                                    {getFieldDecorator('homeseasonpoints', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Away Season Points">
                                    {getFieldDecorator('awayseasonpoints', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Select Home Team">
                                    {getFieldDecorator('hometeam', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select Home Team' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleHomeTeamSelect.bind(this)}>
                                            {this.state.selectHomeTeamData.map((x, index) =>
                                                <Option value={x._id}>{x.teamname}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Select Away Team">
                                    {getFieldDecorator('awayteam', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select away Team' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleAwayTeamSelect.bind(this)}>
                                            {this.state.selectAwayTeamData.map((x, index) =>
                                                <Option value={x._id}>{x.teamname}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Event ID">
                                    {getFieldDecorator('eventId', {
                                        rules: [{ required: false, whitespace: true, message: 'Please enter event id' }],
                                    })(
                                        <Input placeholder="Event ID" />,
                                    )}
                                </Form.Item>



                            </Form>
                        </CustomModal>
                        <CustomModal
                            handleCancel={this.handleEditModalCancel}
                            handleOk={this.handleEditModalOk}
                            visible={this.state.editModalVisible}
                            title="Edit Game"
                            backBtnText="Back"
                            submitBtnText="Submit">
                            <Form {...layout}>
                                <Form.Item label="Select Sports">
                                    {getFieldDecorator('esport', {
                                        initialValue: ['esport'],
                                        rules: [{ required: true, whitespace: true, message: 'Please select sports' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleSportSelect.bind(this)}>
                                            {sport}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Select Round">
                                    {getFieldDecorator('eround', {
                                        initialValue: ['eround'],
                                        rules: [{ required: true, whitespace: true, message: 'Please select round' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleRoundSelect.bind(this)}>
                                            {this.state.selectRoundData.map((x, index) =>
                                                <Option value={x._id}>{x.roundname}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Timezone">
                                    {getFieldDecorator('etimezone', {
                                        initialValue: 'Australia/Sydney',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter timezone' }],
                                    })(
                                        <Input placeholder="Timezone" disabled />,
                                    )}
                                </Form.Item>

                                <Form.Item label="Date">
                                    {getFieldDecorator('edate', {
                                        initialValue: moment(new Date(this.state.editGameDate), 'YYYY/MM/DD'),
                                        rules: [{ required: true, message: 'Please enter date' }],
                                    })(
                                        <DatePicker onChange={this.onEditDateChange} placeholder="Date" />
                                    )}
                                </Form.Item>

                                <Form.Item label="Time">
                                    {getFieldDecorator('etime', {
                                        initialValue: moment(new Date(this.state.editGameTime), 'HH:mm'),
                                        rules: [{ required: true, message: 'Please enter time' }],
                                    })(
                                        <TimePicker onChange={this.onEditTimeChange} format={'HH:mm'} placeholder="Time" />
                                    )}
                                </Form.Item>

                                <Form.Item label="Points">
                                    {getFieldDecorator('epoints', {
                                        initialValue: 'epoints',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" disabled />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Home Team Points">
                                    {getFieldDecorator('ehometeampoints', {
                                        initialValue: 'eawayteampoints',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Away Team Points">
                                    {getFieldDecorator('eawayteampoints', {
                                        initialValue: 'eawayteampoints',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>

                                <Form.Item label="Home Season Points">
                                    {getFieldDecorator('ehomeseasonpoints', {
                                        initialValue: 'eawayseasonpoints',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>
                                <Form.Item label="Away Season Points">
                                    {getFieldDecorator('eawayseasonpoints', {
                                        initialValue: 'eawayseasonpoints',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter winner points' }],
                                    })(
                                        <Input placeholder="Points" />,
                                    )}
                                </Form.Item>

                                <Form.Item label="Select Home Team">
                                    {getFieldDecorator('ehometeam', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select Home Team' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleHomeTeamSelect.bind(this)}>
                                            {this.state.selectHomeTeamData.map((x, index) =>
                                                <Option value={x._id}>{x.teamname}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Select Away Team">
                                    {getFieldDecorator('eawayteam', {
                                        rules: [{ required: true, whitespace: true, message: 'Please select away Team' }],
                                    })(

                                        <Select style={{ width: 200 }} onChange={this.handleAwayTeamSelect.bind(this)}>
                                            {this.state.selectAwayTeamData.map((x, index) =>
                                                <Option value={x._id}>{x.teamname}</Option>,

                                            )}
                                        </Select>
                                    )}
                                </Form.Item>

                                <Form.Item label="Select Winner">
                                    {getFieldDecorator('ewinner', {
                                        initialValue: ['ewinner'],
                                        rules: [{ required: false, whitespace: true, message: 'Please select Winner' }],
                                    })(
                                        <Select style={{ width: 200 }} onChange={this.handleWinnerSelect.bind(this)}>
                                            {this.state.sportType == "Draw" ? this.state.selectWinnerData.map((x, index) =>
                                                <Option value={x.name}>{x.name}</Option>
                                            ) : this.state.selectWinnerData1.map((x, index) =>
                                                <Option value={x.name}>{x.name}</Option>
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Event ID">
                                    {getFieldDecorator('eEventId', {
                                        initialValue: 'eEventId',
                                        rules: [{ required: false, whitespace: true, message: 'Please enter event id' }],
                                    })(
                                        <Input placeholder="Event ID" />,
                                    )}
                                </Form.Item>
                            </Form>


                        </CustomModal>
                        <CustomModal
                            handleCancel={this.handleViewModalCancel}
                            handleOk={this.handleViewModalOk}
                            visible={this.state.viewModalVisible}
                            title="View Game Details"
                            backBtnText="Back"
                            submitBtnText="OK">

                            <Descriptions title={"Game Details (State: " + this.state.viewGameData.gameState + ")"} layout="vertical">
                                <Descriptions.Item label="Sports">{this.state.viewSportData.sportname}</Descriptions.Item>
                                <Descriptions.Item label="Season">{this.state.viewGameData.season}</Descriptions.Item>
                                <Descriptions.Item label="Round No">{this.state.viewRoundData.roundno}</Descriptions.Item>
                                <Descriptions.Item label="Round Name">{this.state.viewRoundData.roundname}</Descriptions.Item>
                                <Descriptions.Item label="Round Start Date">{new Date(this.state.viewRoundData.startDate).toDateString()}</Descriptions.Item>
                                <Descriptions.Item label="Round End Date">{new Date(this.state.viewRoundData.endDate).toDateString()}</Descriptions.Item>
                                <Descriptions.Item label="Home Team">{this.state.viewHomeTeamData.teamname}</Descriptions.Item>
                                <Descriptions.Item label="Away Team">{this.state.viewAwayTeamData.teamname}</Descriptions.Item>
                                <Descriptions.Item label="Game Points">{this.state.viewGameData.points}</Descriptions.Item>
                                <Descriptions.Item label="Home Team Points">{this.state.viewGameData.homeTeamPoints}</Descriptions.Item>
                                <Descriptions.Item label="Away Team Points">{this.state.viewGameData.awayTeamPoints}</Descriptions.Item>
                                <Descriptions.Item label="Home Season Points">{this.state.viewGameData.homeSeasonPoints}</Descriptions.Item>
                                <Descriptions.Item label="Away Season Points">{this.state.viewGameData.awaySeasonPoints}</Descriptions.Item>
                                <Descriptions.Item label="Date">{new Date(this.state.viewGameData.gameDate).toDateString()}</Descriptions.Item>
                                <Descriptions.Item label="Time">{moment(new Date(this.state.viewGameData.gameTime)).format('HH:mm')}</Descriptions.Item>
                                <Descriptions.Item label="Winner">{this.state.viewGameData.winningTeam !== "" ? this.state.viewGameData.winningTeam : "NA"}</Descriptions.Item>
                                <Descriptions.Item label="Home Topsport Odds">{this.state.viewGameData.homeTopTipperPoints}</Descriptions.Item>
                                <Descriptions.Item label="Away Topsport Odds">{this.state.viewGameData.awayTopTipperPoints}</Descriptions.Item>
                                <Descriptions.Item label="Event ID">{this.state.viewGameData.eventId}</Descriptions.Item>
                            </Descriptions>

                        </CustomModal>
                        <CustomModal
                            handleCancel={this.handleResultModalCancel}
                            handleOk={this.handleResultModalOk}
                            visible={this.state.resultModalVisible}
                            title="Update Game Result"
                            backBtnText="Back"
                            submitBtnText="Submit">


                            <Select style={{ width: 200 }} placeholder="Select Winner" onChange={this.handleWinnerSelect.bind(this)}>
                                {this.state.selectWinnerData.map((x, index) =>
                                    <Option value={x.name}>{x.name}</Option>
                                )}

                            </Select>


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
        roundData: state.admin.roundData,
        totalCount: state.admin.gameCount,
        sportData: state.admin.sportData,
        teamData: state.admin.teamData,
        gameData: state.admin.gameData
    };
}
const Game = Form.create({ name: 'game' })(GameList);
export default connect(mapStateToProps, { getSport, getRound, getTeam, getGame, addGame, removeGame, updateGame, updateGameSeason, autoTipping, sendGameStartNotification })(Game);
