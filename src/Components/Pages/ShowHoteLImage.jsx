import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const ShowHoteLImage = () => {
  const location = useLocation();
  const placeDetails = location.state;

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (placeDetails?.places_image) {
      setImages(placeDetails.places_image);
      setLoading(false);
    }
  }, [placeDetails]);

  return (
    <div className="p-4">
      {/* If Loading Show Skeleton */}
      {loading ? (
        <div className="flex gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-1/3 rounded-lg bg-white"
            >
              <div className="animate-pulse">
                <div className="aspect-square w-full bg-gray-300 rounded-xl"></div>

                <div className="p-2 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Gallery */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(item.image)}
            >
              <img
                src={item.image}
                alt="hotel"
                className="w-full h-48 object-cover hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="large"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowHoteLImage;