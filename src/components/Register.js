import React from 'react';
import { Form, Input, Button,message } from 'antd';
import { Link } from 'react-router-dom';
import { API_ROOT } from '../constants';


class RegistrationForm extends React.Component {
    state = {
        confirmDirty: false,
        autoCompleteResult: [],
    };

    render() {
        // console.log(this.props.form);
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        return (
            <Form  {...formItemLayout} onSubmit={this.handleSubmit} className="register">
                <Form.Item label="Username">
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="Password" hasFeedback>
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                            {
                                validator: this.validateToNextPassword,
                            },
                        ],
                    })(<Input.Password />)}
                </Form.Item>
                <Form.Item label="Confirm Password" hasFeedback>
                    {getFieldDecorator('confirm', {
                        rules: [
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            {
                                validator: this.compareToFirstPassword,
                            },
                        ],
                    })(<Input.Password onBlur={this.handleConfirmBlur} />)}
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                    <p>I already have an account, go back to <Link to="/login">login</Link></p>
                </Form.Item>
            </Form>
        );
    }

    handleSubmit = e => {
        //console.log(this.props.form);

        // stop http request, not refresh the page
        e.preventDefault();

        // // get the key
        // console.log(this.props.form.getFieldValue());
        // // get all three values
        // console.log(this.props.form.getFieldsValue());

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);

                fetch(`${API_ROOT}/signup`,{
                    method: `POST`,
                    body: JSON.stringify({
                        username: values.username,
                        password: values.password,
                    }),
                })
                    .then(response => {
                    // console.log(response);
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(response.statusText);
                })
                    .then((data) => {
                        console.log(data);
                        message.success('Registration succeed!');
                        // back to login page
                        console.log(this.props);
                        this.props.history.push('/login');


                    })
                    .catch((err) => {
                        console.error(err);
                        message.error('Registration failed.');
                    });
            }
        });
    };

    handleConfirmBlur = e => {
        const { value } = e.target;
        // console.log('--> ', value);
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        // console.log('11 -> ', rule);
        // console.log('12 -> ', value);

        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props
        // console.log('21 -> ', rule);
        // console.log('22 -> ', value);

        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };
}

const Register = Form.create({ name: 'register' })(RegistrationForm)

export default Register;