import React from "react";

import Pagination from "@/components/Pagination";
import Layout from "@/components/Layout";
import EventItem from "@/components/EventItem";
import { API_URL, PER_PAGE } from "@/config/index";

function EventsPage({ events, page, total }) {
  return (
    <Layout>
      <h1>Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      <Pagination page={page} total={total} />
    </Layout>
  );
}

export async function getServerSideProps({ query: { page = 1 } }) {
  // calculate starting page
  const start = +page === 1 ? 0 : (+page - 1) * PER_PAGE;

  // fetch total/count of events
  const totalRes = await fetch(
    `${API_URL}/api/events?pagination[withCount]=true`
  );
  const totalResJson = await totalRes.json();
  const total = totalResJson.meta.pagination.total;

  // fetch events with limit defined by PER_PAGE
  const eventRes = await fetch(
    `${API_URL}/api/events?pagination[page]=${page}&pagination[pageSize]=${PER_PAGE}&populate=*`
  );
  const eventResJson = await eventRes.json();
  const events = eventResJson.data;

  return {
    props: { events, page: +page, total },
  };
}

export default EventsPage;
