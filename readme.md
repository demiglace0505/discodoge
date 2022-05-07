# DiscoDoge

This is a project built from Brad Traversy's course [Next.js Dev to Deployment](https://www.udemy.com/course/nextjs-dev-to-deployment/). In this project, we used Next.js and Strapi for the backend, from which we can manage users, events and media. This project gives users the ability to create their accounts and manage events. We use Cloudinary for hosting and optimizing our images. The project also features authentication using json web tokens, page pagination, search functionality, and maps using mapbox. For dev, the database will be using the default SQLite that Strapi uses. For prod, we will be deploying Strapi to Heroku and use postgres. The Next.js app will be deployed in Vercel.

Next.js is a React framework that enables functionality such as SSR and SSG. This allows the first page load to be rendered by the server which is great for SEO and performance. It also gives us data fetching methods, api routes, out of the box TypeScript and Sass. Next.js also have backend capabilities that can handle request response, creating api routes. In order to host a full Next.js application, the server needs to have node.js installed.

## Next.js Fundamentals

### Pages, Routing and Next Link

Next.js Comes with routing out of the box. Using the **useRouter()** hook from next/router, we can programatically redirect and get the params from the url.

```javascript
import React from "react";
import { useRouter } from "next/router";

function EventPage() {
  const router = useRouter();
  console.log(router);
  return (
    <div>
      <h1>Events</h1>
      <h3>{router.query.slug}</h3>
      <button onClick={() => router.push("/")}>Home</button>
    </div>
  );
}
```

### Head and Layout

Using the **Head** component from next/head, we can add metadata to our project.

```javascript
import React from "react";
import Head from "next/head";
import styles from "../styles/Layout.module.css";

import Header from "./Header";
import Footer from "./Footer";

function Layout({ title, keywords, description, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>

      <Header />
      <div className={styles.container}>{children}</div>
      <Footer />
    </div>
  );
}

Layout.defaultProps = {
  title: "Disco Doge | Such Groovy!",
  description: "Find the latest DJ and musical events",
  keywords: "music, dj, doge",
};

export default Layout;
```

### Module Alias

Using Module Aliases, we can simplify folder navigation when importing. We create a jsconfig.json file

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["components/*"],
      "@/styles/*": ["styles/*"]
    }
  }
}
```

Instead of doing

```javascript
import Layout from "../../components/Layout";
```

We can use @ instead

```javascript
import Layout from "@/components/Layout";
```

## Data Fetching

### Api Routes

Any file inside the /pages/api is mapped to /api/\* and will be treated as an API endpoint instead of a page. Using a file [slug].js, we can set up an api endpoint for /events/[slug].

```javascript
const { events } = require("./data.json");

// return event according to slug
export default (req, res) => {
  const evt = events.filter((e) => e.slug === req.query.slug);

  if (req.method === "GET") {
    res.status(200).json(evt);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} is not allowed` });
  }
};
```

One caveat for api routes is that it cannot be used with `next export`.

### getServerSideProps and getStaticProps

getServerSideProps is for server side rendering will fetch data on each request. This means that everytime we go to a page, it fetches the data from the backend. getStaticProps on the other hand, fetches data at build time. This is used for static site generation.

```javascript
export async function getServerSideProps() {
  const res = await fetch(`${API_URL}/api/events`);
  const events = await res.json();

  console.log(events); // will run serverside
  return {
    props: { events },
  };
}
```

```javascript
export async function getStaticProps() {
  const res = await fetch(`${API_URL}/api/events`);
  const events = await res.json();

  console.log(events); // will run serverside
  return {
    props: { events },
    revalidate: 1,
  };
}
```

### getStaticPaths

getStaticPaths is used in combination with getStaticProps to fetch a single event data. When we navigate to a specific event, we get the slug and make a request to our api route to get the details for that single event.

```javascript
export async function getStaticPaths() {
  const res = await fetch(`${API_URL}/api/events`);
  const events = await res.json();

  const paths = events.map((evt) => ({ params: { slug: evt.slug } }));

  return {
    paths,
    // fallback: false, // show a 404 if slug isnt found,
    fallback: true,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const res = await fetch(`${API_URL}/api/events/${slug}`);
  const events = await res.json();

  return {
    props: {
      evt: events[0],
    },
    revalidate: 1,
  };
}
```

## Strapi Backend

To use Cloudinary with Strapi, we need to install @strapi/provider-upload-cloudinary in our Strapi backend repository. We need to create the following plugins.js configuration file under /config. This is so that any image that is uploaded through Strapi will get uploaded as well to Cloudinary.

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
});
```

And configure strapi security in the middlewares.js file as well.

```javascript
module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
```
