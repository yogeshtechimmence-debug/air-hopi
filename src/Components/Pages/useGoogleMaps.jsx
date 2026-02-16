import { useEffect, useRef } from "react";

let isLoaded = false;

export default function useGoogleMaps() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (window.google || isLoaded) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
    };

    document.body.appendChild(script);
  }, []);
}
