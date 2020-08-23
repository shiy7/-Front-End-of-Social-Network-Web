import React, {Component} from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { API_ROOT } from '../constants';

class NormalLoginForm extends Component {
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Username"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="Password"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                    Or <Link to="/register">register now!</Link>
                    {/* link: Provides declarative, accessible navigation around your application.*/}
                </Form.Item>
            </Form>
        );
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);

                // Fetch API provides a JavaScript interface for accessing and manipulating
                // parts of the HTTP pipeline, such as requests and responses.
                // It also provides a global fetch() method that provides an easy,
                // logical way to fetch resources asynchronously across the network.
                fetch(`${API_ROOT}/login`, {
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
                        throw new Error(response.stateText);
                    })
                    .then(data => {
                        console.log("data => ", data);
                        //step4: 登录成功，保存token -> 用于实现持久登录
                        this.props.handleLoginSucceed(data);
                        message.success('Login succeed!');
                    })
                    .catch((err) => {
                        console.error(err);
                        message.error('Login failed.');
                    });
            }
        });
    };
}

const Login = Form.create({ name: 'normal_login' })(NormalLoginForm)
export default Login;