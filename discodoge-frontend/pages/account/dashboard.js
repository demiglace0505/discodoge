import React from "react";

import Layout from "@/components/Layout";
import DashboardEvent from "@/components/DashboardEvent";
import { API_URL } from "@/config/index";
import { parseCookies } from "@/helpers/index";
import styles from "@/styles/Dashboard.module.css";

function DashboardPage({ events }) {
  const deleteEvent = (id) => {
    console.log(id);
  };

  return (
    <Layout title="User Dashboard">
      <div className={styles.dash}>
        <h1>Dashboard</h1>
        <h3>My Events</h3>
        {events.map((evt) => {
          return (
            <DashboardEvent key={evt.id} evt={evt} handleDelete={deleteEvent} />
          );
        })}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  const { token } = parseCookies(req);
  // console.log(token);

  // get current logged in user's events
  const res = await fetch(`${API_URL}/api/events/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // console.log("!", res);

  const events = await res.json();

  return {
    props: {
      events,
    },
  };
}

export default DashboardPage;
