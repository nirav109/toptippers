import React, { Component } from "react";
import { Button, Form, Input } from "antd";
import { resetPassword } from '../modules/login/actions/loginActions';
import { connect } from 'react-redux';
const FormItem = Form.Item;

class ResetPassword extends Component {

    state = {
        confirmDirty: false,
        autoCompleteResult: [],
    };

    handleSubmit = (e) => {
        let self = this;
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err, values) => {
            let obj = {
                password: values.password,
                resetKey_value: self.props.match.params.resetKey
            }
            if (!err) {
                console.log('Received values of form: ', values);
                this.props.resetPassword(obj)
            }
        });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="gx-login-container">
                <div className="gx-login-content">

                    {/* <div className="gx-login-header">
                        <img src={require("../img/logo.png")} style={{ width: 100, borderRadius: 5 }} alt="" title="" />
                    </div> */}
                    <div className="gx-mb-4">
                        <h2>Reset Password</h2>
                        <p></p>
                    </div>


                    <Form onSubmit={this.handleSubmit} className="gx-login-form gx-form-row0">

                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{
                                    required: true, message: 'Please enter your password',
                                }, {
                                    validator: this.validateToNextPassword,
                                }, {
                                    max: 20, message: 'Maximum 20 characters allowed',
                                }, {
                                    min: 6, message: 'Minimum 6 characters required',
                                }],
                            })(
                                <Input type="password" placeholder="New Password" />
                            )}
                        </FormItem>

                        <FormItem>
                            {getFieldDecorator('confirm', {
                                rules: [{
                                    required: true, message: 'Please confirm your password',
                                }, {
                                    validator: this.compareToFirstPassword,
                                }],
                            })(
                                <Input placeholder="Retype New Password" type="password" onBlur={this.handleConfirmBlur} />
                            )}
                        </FormItem>

                        <FormItem>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </FormItem>
                    </Form>


                </div>
            </div>
        );
    }
}


const WrappedResetPasswordForm = Form.create({ name: 'reset' })(ResetPassword);

export default connect(null, { resetPassword })(WrappedResetPasswordForm);
