import React, { Component } from "react";
import { Button, Form, Input, Icon } from "antd";
import { Link } from "react-router-dom";
import { forgotPassword } from '../modules/login/actions/loginActions';
import { connect } from 'react-redux';

const FormItem = Form.Item;

class ForgotPassword extends Component {

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                this.props.forgotPassword(values)
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-login-container">
                <div className="gx-login-content">

                    {/* <div className="gx-login-header">
                        <img src={require("../img/logo.png")} style={{ width: 100, borderRadius:5  }} alt="yellowCow" title="yellowCow" />
                    </div> */}
                    <div className="gx-mb-4">
                        <h2>Forgot Password</h2>
                        <p></p>
                    </div>

                    <Form layout="vertical" onSubmit={this.handleSubmit} className="gx-login-form gx-form-row0">

                        <FormItem>
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid email',
                                }, {
                                    required: true, message: 'Please enter your email',
                                }],
                            })(
                                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} type="email" placeholder="Email" />
                            )}
                        </FormItem>
                        <FormItem>
                            <Link className="gx-login-form-forgot" to="/">Sign In</Link>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit">
                                Send
                             </Button>
                        </FormItem>
                    </Form>

                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {};
}

const WrappedForgotPasswordForm = Form.create()(ForgotPassword);

export default connect(mapStateToProps, { forgotPassword })(WrappedForgotPasswordForm);

