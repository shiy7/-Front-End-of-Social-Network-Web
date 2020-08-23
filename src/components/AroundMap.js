import React, {Component} from 'react';
import { POS_KEY } from '../constants';
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
} from "react-google-maps";

import AroundMarker from "./AroundMarker"

class NormalAroundMap extends Component {
    // get map instance
    getMapRef = (mapInstance) => {
        // console.log(mapInstance);
        this.map = mapInstance;
        window.map = mapInstance;
    }

    reloadMarker = () => {
        // get location
        const center = this.getCenter();
        // get radius
        const radius = this.getRadius();
        //reload post -> call this.props.loadPostsByTopic
        this.props.loadPostsByTopic(center, radius);
    }

    // return the center
    getCenter() {
        const center = this.map.getCenter();
        // console.log('==> ', center); // get object with lat and lon
        return {
            lat: center.lat(),
            lon: center.lng()
        };
    }

    // return the radius of the center in meter
    getRadius() {
        const center = this.map.getCenter();
        // return the lat/lng bounds of the current viewport
        const bounds = this.map.getBounds();
        if (center && bounds) {
            const ne = bounds.getNorthEast();
            const right = new window.google.maps.LatLng(center.lat(), ne.lng());
            return 0.001 * window.google.maps.geometry.spherical.computeDistanceBetween(center, right);
        }
    }

    render() {
        const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
        return (
            <GoogleMap
                ref={this.getMapRef}
                defaultZoom={11}
                defaultCenter={{ lat, lng: lon }}
                onDragEnd={this.reloadMarker}
                onZoomChanged={this.reloadMarker}
            >
                {
                    this.props.posts.map(
                        post => <AroundMarker post={post} key={post.url} />
                    )
                }
            </GoogleMap>

        );
    }
}

// withGoogleMap: to initializa the NormalAroundMap component with DOM instance, wrap it with withGoogleMap HOC
// withScriptjs: to correctly load google maps JavaScript API, wrap it with withScriptjs HOC
const AroundMap = withScriptjs(withGoogleMap(NormalAroundMap));
export default AroundMap;