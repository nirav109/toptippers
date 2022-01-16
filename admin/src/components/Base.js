import React from 'react';
import AppHeader from './Header';
import Sidebaar from './Sidebar';
import AppFooter from './Footer';
import { Layout } from 'antd';
const { Content } = Layout;
class Base extends React.Component {
    state = {
        collapsed: false,
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    render() {
        let props = this.props;
        return (<Layout>
            <Sidebaar trigger={null} collapsible collapsed={this.state.collapsed} />
            <Layout>
                <AppHeader collapsed={this.state.collapsed} toggle={this.toggle} user={props} />
                <Content
                    style={{
                        padding: 24,
                    }} >
                    {this.props.children}
                </Content>
            </Layout>
        </Layout>);
    }

}

export default Base;
