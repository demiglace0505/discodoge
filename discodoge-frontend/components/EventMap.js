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
        // console.log(lat, lng);
        setLat(lat);
        setLong(lng);
        setLoading(false);
      },
      (error) => {
        console.error("GEOCODE ERROR:", error);
      }
    );
  }, []);

  if (loading) return false;
  console.log(lat, lng);

  return (
    <div>
      <Map
        initialViewState={{
          longitude: 40.712772,
          latitude: -73.935242,
          zoom: 14,
        }}
        style={{ width: 600, height: 400 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        <Marker longitude={lng} latitude={lat} color="red" />
      </Map>
    </div>
  );
}

export default EventMap;
