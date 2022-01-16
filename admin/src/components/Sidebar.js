import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import { withRouter } from 'react-router-dom';
import toptippers from '../img/toptippers.png';


const { Sider } = Layout;
const { SubMenu } = Menu;

class Sidebaar extends React.Component {
  render() {
    let path = this.props.location.pathname;
    return (<Sider trigger={null} collapsible collapsed={this.props.collapsed}>
      <div className="logo">
        {/* <b>Tipping App</b> */}
        <img width="20px" src={'http://via.placeholder.com/150x150'} className="gx-size-50 gx-pointer cursor-pointer" alt="toptippers" />
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[path]}>
        <Menu.Item key="/dashboard" onClick={() => this.props.history.push('/dashboard')}>
          <Icon type="dashboard" />
          <span>Dashboard</span>
        </Menu.Item>
        <Menu.Item key="/users" onClick={() => this.props.history.push('/users')}>
          <Icon type="user" />
          <span>Manage User</span>
        </Menu.Item>
        <Menu.Item key="/messaging" onClick={() => this.props.history.push('/messaging')}>
          <Icon type="user" />
          <span>Messaging</span>
        </Menu.Item>

        <SubMenu
          key="/sport"
          title={
            <span>
              <Icon type="appstore" />
              <span>Master</span>
            </span>
          }
        >
          <Menu.Item key="1" onClick={() => this.props.history.push('/season')} >Manage Season</Menu.Item>
          <Menu.Item key="1" onClick={() => this.props.history.push('/sport')} >Manage Sport</Menu.Item>
          <Menu.Item key="2" onClick={() => this.props.history.push('/team')} >Manage Team</Menu.Item>
          {/*<Menu.Item key="3" onClick={() => this.props.history.push('/bonus')} >Manage Bonus</Menu.Item>*/}
          <Menu.Item key="4" onClick={() => this.props.history.push('/round')} >Manage Round</Menu.Item>
          <Menu.Item key="5" onClick={() => this.props.history.push('/game')} >Manage Game</Menu.Item>
          <Menu.Item key="6" onClick={() => this.props.history.push('/competition')} >Manage Competition</Menu.Item>

        </SubMenu>
        <SubMenu
          key="/cms"
          title={
            <span>
              <Icon type="appstore" />
              <span>CMS</span>
            </span>
          }
        >
          <Menu.Item key="1" onClick={() => this.props.history.push('/topics')} >Topics</Menu.Item>
          <Menu.Item key="2" onClick={() => this.props.history.push('/questions')} >Questions</Menu.Item>
          <Menu.Item key="3" onClick={() => this.props.history.push('/content')} >Content</Menu.Item>
        </SubMenu>
        <SubMenu
          key="/ad"
          title={
            <span>
              <Icon type="appstore" />
              <span>Ad Management</span>
            </span>
          }
        >
          <Menu.Item key="1" onClick={() => this.props.history.push('/ads')} >Ads</Menu.Item>
          <Menu.Item key="2" onClick={() => this.props.history.push('/adreport')} >Report</Menu.Item>

        </SubMenu>
      </Menu>
    </Sider>);
  }
}

export default withRouter(Sidebaar);
