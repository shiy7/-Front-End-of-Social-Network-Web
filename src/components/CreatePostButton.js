import React, {Component} from 'react';
import { Modal, Button, message } from 'antd';
import { API_ROOT, AUTH_HEADER, TOKEN_KEY, POS_KEY } from '../constants';
import CreatePostForm from './CreatePostForm';

class CreatePostButton extends Component {
    state = {
        visible: false,
        confirmLoading: false,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        console.log('ok')
        // this.setState({
        //     visible: false,
        // });
        this.form.validateFields((err, values) => {
            console.log(values);
            if (!err) {
                // url (token, position)
                const token = localStorage.getItem(TOKEN_KEY);
                // convert string to JSON
                const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));

                // file
                // FormData: 可以直接用http拿取数据，不用刷新，而且easily construct key/value pairs
                const formData = new FormData();
                formData.set('lat', lat);
                formData.set('lon', lon);
                formData.set('message', values.message);
                // image: array
                formData.set('image', values.image[0].originFileObj);

                this.setState({ confirmLoading: true });
                // send
                // send data to back-end
                fetch(`${API_ROOT}/post`, {
                    method: 'POST',
                    headers: {
                        Authorization: `${AUTH_HEADER} ${token}`
                    },
                    body: formData,
                })
                    // get response from back-end
                    .then((response) => {
                        if (response.ok) {
                            return this.props.loadNearbyPosts();
                        }
                        throw new Error('Failed to create post.');
                    })
                    // close upload window
                    .then(() => {
                        this.setState({ visible: false, confirmLoading: false });
                        this.form.resetFields();
                        message.success('Post created successfully!');
                    })
                    .catch((e) => {
                        console.error(e);
                        message.error('Failed to create post.');
                        this.setState({ confirmLoading: false });
                    });
            }
        })
    };

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    };

    getFormRef = (formObj) => {
        console.log(formObj)
        this.form = formObj;

    }

    render() {
        const { visible, confirmLoading } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>
                    Create New Post
                </Button>
                <Modal
                    title="Create New Post"
                    visible={visible}
                    onOk={this.handleOk}
                    okText='Create'
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel}
                >
                    {/*
                    ref: uncontrolled component
                    1. use creatRef
                    2. use callback function
                    */}
                    <CreatePostForm ref={this.getFormRef}/>
                </Modal>
            </div>
        );
    }
}

export default CreatePostButton;