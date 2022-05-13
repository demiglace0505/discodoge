import React from "react";
import Link from "next/link";

import Layout from "@/components/Layout";
import EventItem from "@/components/EventItem";
import { API_URL } from "@/config/index";

function HomePage({ events }) {
  return (
    <Layout>
      <h1>Upcoming Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      {events.length > 0 && (
        <Link href="/events">
          <a className="btn-secondary">View All Events</a>
        </Link>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const qs = require("qs");
  const query = qs.stringify(
    {
      populate: "*",
      sort: ["date:asc"],
      pagination: {
        start: 0,
        limit: 3,
      },
    },
    {
      encodeValuesOnly: true,
    }
  );

  const res = await fetch(`${API_URL}/api/events?${query}`);
  // const res = await fetch(
  //   `${API_URL}/api/events?populate=*&_sort=date:ASC&_limit=3`
  // );
  const json = await res.json();
  const events = json.data;
  // console.log("events fetched", events.data); // will run serverside

  return {
    props: { events },
    revalidate: 1,
  };
}

export default HomePage;
