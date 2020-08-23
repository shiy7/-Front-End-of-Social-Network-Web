import React, {Component} from 'react';
import GridGallery from 'react-grid-gallery';
// prop-types: typechecking to check the data type
import PropTypes from 'prop-types';

class Gallery extends Component {
    static propTypes = {
        images: PropTypes.arrayOf(
            PropTypes.shape({
                user: PropTypes.string.isRequired,
                src: PropTypes.string.isRequired,
                thumbnail: PropTypes.string.isRequired,
                caption: PropTypes.string,
                thumbnailWidth: PropTypes.number.isRequired,
                thumbnailHeight: PropTypes.number.isRequired
            })
        ).isRequired
    }

    render() {
        const {images} = this.props;
        console.log(images);

        const imageArr = images.map(image => {
            return {
                // all other elements in image keep same, just to add customOverlay
                ...image,
                customOverlay: (
                    <div className="gallery-thumbnail">
                        <div>{`${image.user}: ${image.caption}`}</div>
                    </div>
                )
            }
        })
        return (
            <div className="gallery">
                <GridGallery
                    images={imageArr}
                    // allow users to exit the lightbox by clicking the backdrop
                    backdropClosesModal
                    // to remove images to be selectable
                    enableImageSelection={false}
                />
            </div>
        );
    }
}

export default Gallery;