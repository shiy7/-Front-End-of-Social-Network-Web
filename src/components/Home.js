import React, {Component} from 'react';
import {Tabs, Spin, Row, Col, Radio} from 'antd';
import {
    GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_HEADER, TOKEN_KEY,
    POST_TYPE_IMAGE, POST_TYPE_VIDEO, POST_TYPE_UNKNOWN,
    TOPIC_AROUND, TOPIC_FACE
} from '../constants'
import Gallery from './Gallery';
import CreatePostButton from './CreatePostButton';
import AroundMap from './AroundMap';

const {TabPane} = Tabs;

class Home extends Component {
    state = {
        isLoadingGeoLocation: false,
        isLoadingPosts: false,
        error: '',
        posts: [],
        topic: TOPIC_AROUND
    }

    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadPostsByTopic}/>;

        return (
            <div>
                <Radio.Group onChange={this.handleTopicChange} value={this.state.topic}>
                    <Radio value={TOPIC_AROUND}>Posts Around Me</Radio>
                    <Radio value={TOPIC_FACE}>Faces Around The World</Radio>
                </Radio.Group>
                <Tabs tabBarExtraContent={operations}>
                    <TabPane tab="Image Post" key="1"
                             className="main-tabs"
                    >
                        {this.renderPosts(POST_TYPE_IMAGE)}
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        {this.renderPosts(POST_TYPE_VIDEO)}
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <AroundMap
                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `600px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            // send posts to AroundMap
                            posts={this.state.posts}
                            loadPostsByTopic={this.loadPostsByTopic}
                        />
                    </TabPane>
                </Tabs>
            </div>

        );
    }

    componentDidMount() {
        // fetch geolocation
        if ("geolocation" in navigator) {
            this.setState({
                isLoadGeoLocation: true,
                error: ''
            });
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            );
        } else {
            this.setState({error: 'Geolocation is not supported.'});
        }
    }


    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        // save position into local storage
        const {latitude, longitude} = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({lat: latitude, lon: longitude}))
        //
        this.setState({isLoadingGeoLocation: false, error: ''});
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = (err) => {
        console.log('err -> ', err);
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load geo location.'
        });
    }

    // center from Map when moving the map
    loadNearbyPosts = (center, radius) => {
        //check if center exists
        // 和保存到localstorage的key对应
        const {lat, lon} = center ? center : JSON.parse(localStorage.getItem(POS_KEY));
        // radius unit depends on back-end
        const range = radius ? radius : 20000;

        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({isLoadingPosts: true, error: ''});
        // get data from back-end
        // send API Request
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`
            }
        })
            // get response
            .then((response) => {
                console.log('res -> ', response);
                if (response.ok) {
                    // get response data as json format
                    return response.json();
                }
                throw new Error('Failed to load post.');
            })
            .then((data) => {
                console.log("data2 => ", data);
                // record post data
                this.setState({posts: data ? data : [], isLoadingPosts: false});
            })
            .catch((e) => {
                console.error(e);
                this.setState({isLoadingPosts: false, error: e.message});
            });
    }

    renderPosts = (type) => {
        const {isLoadingPosts, error, isLoadingGeoLocation, posts} = this.state;

        // 1. has error
        if (error) {
            return error;
        } else if (isLoadingGeoLocation) {  // 2. loading geolocation
            // spin ?
            return <Spin tip="Loading geo location..."/>;
        } else if (isLoadingPosts) {  // 3. loading posts
            return <Spin tip="Loading posts..."/>
        } else if (posts.length > 0) {   // 4. have posts ready
            // case 1: image
            // case 2: video
            return type === POST_TYPE_IMAGE ?
                this.renderImagePosts() : this.renderVideoPosts();
        } else {
            return 'No nearby posts';
        }

    }

    renderImagePosts = () => {
        const { posts } = this.state;
        const images = posts
            // remove video post
            .filter((post) => post.type === POST_TYPE_IMAGE)
            // remove the useless attributes
            .map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                };
            });
        console.log('posts -> ', images);
        return <Gallery  images={images}/>
        // this Gallery is the web component, not the library
    }

    renderVideoPosts = () => {
        const { posts } = this.state;
        return (
            <Row gutter={30}>
                {
                    posts
                        .filter((post) => [POST_TYPE_VIDEO, POST_TYPE_UNKNOWN].includes(post.type))
                        .map((post) => (
                            <Col span={6} key={post.url}>
                                <video src={post.url} controls={true} className="video-block"/>
                                <p>{post.user}: {post.message}</p>
                            </Col>
                        ))
                }
            </Row>
        );
    }


    handleTopicChange = (e) => {
        // current selected value
        const topic = e.target.value;
        // reset
        this.setState({ topic });
        // case 1: topic around -> load near by
        if (topic === TOPIC_AROUND) {
            this.loadNearbyPosts();
        // case 2: face around -> load face around
        } else {
            this.loadFacesAroundTheWorld();
        }
    }

    loadFacesAroundTheWorld = () => {
        // get token
        const token = localStorage.getItem(TOKEN_KEY);

        // set status to loading
        this.setState({
            isLoadingPosts: true,
            error: ''
        });

        // fetch data from server
        // fetch(url, {method, 验证方法}
        return fetch(`${API_ROOT}/cluster?term=face`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to load posts');
            })
            .then((data) => {
                console.log(data);
                this.setState({
                    posts: data ? data : [], isLoadingPosts: false
                });
            })
            .catch((e) => {
                console.error(e);
                this.setState({
                    isLoadingPosts: false ,
                    error: e.message
                });
            });
    }

    loadPostsByTopic = (center, radius) => {
        if (this.state.topic === TOPIC_AROUND) {
            return this.loadNearbyPosts(center, radius);
        } else {
            return this.loadFacesAroundTheWorld();
        }
    }



}

export default Home;