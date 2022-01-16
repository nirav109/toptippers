
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Icon, Input, Button } from 'antd';
import { Link } from "react-router-dom";
import { loginAction } from './actions/loginActions';
import history from '../../history';
import * as constant from './../../actions/constant';



const FormItem = Form.Item;

class LoginForm extends Component {

  componentDidMount() {
    localStorage.clear()
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var data = {
          email: values.email,
          password: values.password,
          isAdmin: true
        }
      
        history.push(constant.DASHBOARD);
        
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (<div className="gx-login-container">
      <div className="gx-login-content">
        <div className="gx-login-header">
          <img src={""} style={{ width: 100, borderRadius: 5 }} alt="" title="" />
        </div>
        <div className="gx-mb-4 gx-text-center">
          <h2>Login</h2>
        </div>
        <Form onSubmit={this.handleSubmit} className="gx-login-form gx-form-row0">
          <FormItem>
            {getFieldDecorator('email', {
              rules: [{
                type: 'email',
                message: 'The input is not valid email',
              }, { required: true, message: 'Please enter your email' }],
            })(
              <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Email" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please enter your password' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password" />
            )}
          </FormItem>
          <FormItem>
            <Link to="/forgot">Forgot Password?</Link>
          </FormItem>
          <FormItem className="gx-text-center">
            <Button type="primary" style={{ width: '100%' }} htmlType="submit">
              Login
            </Button>
          </FormItem>

        </Form>
      </div>
    </div>);
  }
}

function mapStateToProps(state) { }

const Login = Form.create({ name: 'login' })(LoginForm);

export default connect(mapStateToProps, { loginAction })(Login);
