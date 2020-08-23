import React, {Component} from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import PropTypes from 'prop-types';
import blueMarkerUrl from '../assets/images/blue-marker.svg';

// AroundMarker to use for show the location in map
class AroundMarker extends Component {
    // 类型校验 to check if the post is object
    static propTypes = {
        post: PropTypes.object.isRequired,
    }
    // flag
    state = {
        isOpen:false,
    }

    // to control if to show infoWindow or not
    handleToggle = () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }));
    }

    render() {
        const { user, message, url, location, type } = this.props.post;
        const { lat, lon } = location;

        const isImagePost = type === 'image';
        const customIcon = isImagePost ? undefined : {
            url: blueMarkerUrl,
            scaledSize: new window.google.maps.Size(26, 41),
        };

        return (
            <Marker
                position={{lat, lng: lon}}
                onClick={this.handleToggle}
                // onMouseOver={isImagePost ? this.handleToggle : undefined}
                // onMouseOut={isImagePost ? this.handleToggle : undefined }
                icon={customIcon}
            >
                {
                    this.state.isOpen ?
                        (
                            <InfoWindow>
                                <div>
                                    {isImagePost
                                        ? <img src={url} alt={message} className="around-marker-image"/>
                                        : <video src={url} controls className="around-marker-video"/>
                                    }
                                    <p>{`${user}:${message}`}</p>
                                </div>
                            </InfoWindow>
                        ) : null
                }
            </Marker>

        );
    }
}

export default AroundMarker;