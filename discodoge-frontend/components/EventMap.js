import React, { useState, useEffect } from "react";
import Image from "next/image";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Geocode from "react-geocode";

function EventMap({ evt }) {
  const [lat, setLat] = useState(null);
  const [lng, setLong] = useState(null);
  const [loading, setLoading] = useState(true);
  Geocode.setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY);

  useEffect(() => {
    Geocode.fromAddress(evt.address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log("map coordinates:", lat, lng);
        setLat(lat);
        setLong(lng);
        setLoading(false);
      },
      (error) => {
        console.error("GEOCODE ERROR:", error);
      }
    );
  }, []);

  if (loading) return <h4>Error: Could not load Map Data</h4>;

  return (
    <div>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 7,
        }}
        style={{ width: 600, height: 400 }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
      >
        <Marker longitude={lng} latitude={lat} color="red" />
      </Map>
    </div>
  );
}

export default EventMap;
