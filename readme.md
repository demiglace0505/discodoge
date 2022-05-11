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

## Connecting to Strapi API

To connect to the strapi api, we configure config/index.js to point to port 1337 instead of 3000

```javascript
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
```

We then update the logic for fetching data

```javascript
export async function getStaticProps() {
  const res = await fetch(
    `${API_URL}/api/events?populate=*&_sort=date:ASC&_limit=3`
  );
  const json = await res.json();
  const events = json.data;
  // console.log("events fetched", events.data); // will run serverside

  return {
    props: { events },
    revalidate: 1,
  };
}
```

To import images from an outside source using next <Image> component, we need to also configure next.config.js in our frontend root.

```javascript
module.exports = {
  images: {
    domains: ["res.cloudinary.com"],
  },
};
```

We can then import the images. For an EventItem, we can use the thumbnail.

```javascript
function EventItem({ evt }) {
  const { attributes } = evt;
  return (
    <div className={styles.event}>
      <div className={styles.img}>
        <Image
          src={
            attributes.image
              ? attributes.image.data.attributes.formats.thumbnail.url
              : "/images/event-default.png"
          }
          width={170}
          height={100}
        />
      </div>
      <div className={styles.info}>
        <span>
          {attributes.date} at {attributes.time}
        </span>
        <h3>{attributes.name}</h3>
      </div>
      <div className={styles.link}>
        <Link href={`/events/${attributes.slug}`}>
          <a className="btn">Details</a>
        </Link>
      </div>
    </div>
  );
}
```

Likewise, we can do the same for the event details in events/[slug].js

```javascript
function EventPage({ evt }) {
  const { attributes } = evt;
  const deleteEvent = (e) => {
    console.log("delete");
  };

  return (
    <Layout>
      <div className={styles.event}>
        <div className={styles.controls}>
          <Link href={`/events/edit/${attributes.id}`}>
            <a>
              <FaPencilAlt /> Edit Event
            </a>
          </Link>
          <a href="#" className={styles.delete} onClick={deleteEvent}>
            <FaTimes /> Delete Event
          </a>
        </div>

        <span>
          {attributes.date} at {attributes.time}
        </span>
        <h1>{attributes.name}</h1>
        {attributes.image && (
          <div className={styles.image}>
            <Image
              src={attributes.image.data.attributes.formats.large.url}
              width={960}
              height={600}
            />
          </div>
        )}

        <h3>Performers:</h3>
        <p>{attributes.performers}</p>

        <h3>Description:</h3>
        <p>{attributes.description}</p>

        <h3>Venue: {attributes.venue}</h3>
        <p>{attributes.address}</p>

        <Link href="/events">
          <a className={styles.back}>{"<"} Go Back</a>
        </Link>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const res = await fetch(`${API_URL}/api/events?populate=*`);
  const json = await res.json();
  const events = json.data;

  const paths = events.map((evt) => ({
    params: { slug: evt.attributes.slug },
  }));

  return {
    paths,
    // fallback: false, // show a 404 if slug isnt found,
    fallback: true,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const res = await fetch(
    `${API_URL}/api/events?filters[slug][$eq]=${slug}&populate=*`
  );
  const json = await res.json();
  const events = json.data;

  return {
    props: {
      evt: events[0],
    },
    revalidate: 1,
  };
}
```

## Implementing Search

To implement search, we use the third party library qs for building query strings. We can create a new events/search.js page that takes in the **term** from the url. qs allows us to make us of **and** and **or** operators.

```javascript
export async function getServerSideProps({ query: { term } }) {
  const query = qs.stringify(
    {
      filters: {
        $or: [
          {
            name: {
              $containsi: term,
            },
          },
          {
            performers: {
              $containsi: term,
            },
          },
          {
            description: {
              $containsi: term,
            },
          },
          {
            venue: {
              $containsi: term,
            },
          },
        ],
      },
    },
    {
      encode: false,
    }
  );

  const res = await fetch(`${API_URL}/api/events?${query}&populate=*`);
  const events = await res.json();

  return {
    props: { events: events.data },
  };
}
```

If we navigate to `http://localhost:3000/events/search?term=mc%20neat`, we will get a search result page that searches for `mc neat` in the name, performers, description or venue fields.

We can then build out the Search component

```javascript
function Search() {
  const [term, setTerm] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/events/search?term=${term}`);
    setTerm("");
  };

  return (
    <div className={styles.search}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search Events"
        />
      </form>
    </div>
  );
}
```

## Adding Events

For adding events, we make use of a form field together with state hooks. We can create a simple validation by using **some()** method to check if an element has blank values. For notifications, we use react-toastify library

```javascript
const [values, setValues] = useState({
  name: "",
  performers: "",
  venue: "",
  address: "",
  date: "",
  time: "",
  description: "",
});
const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  const hasEmptyFields = Object.values(values).some((el) => el === "");

  if (hasEmptyFields) {
    toast.error("Please fill in all fields");
    return;
  }

  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: values }),
  });

  if (!res.ok) {
    toast.error("Something went wrong");
  } else {
    const json = await res.json();
    const evt = json.data;
    router.push(`/events/${evt.attributes.slug}`);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setValues({ ...values, [name]: value });
};
```

We also need to generate a slug whenever we submit a new event from the frontend. We need to create a lifecycle hook on the backend under `src/api/<class-name>/content-types/<class-name>/lifecycles.js`.

```javascript
const slugify = require("slugify");

module.exports = {
  beforeCreate(event) {
    setSlug(event.params.data);
  },
  beforeUpdate(event) {
    setSlug(event.params.data);
  },
};

const setSlug = (data) => {
  if (data.name) {
    data.slug = slugify(data.name.toLowerCase());
  }
};
```

_A better way for strapi v4 is to use slug natively https://strapi.io/blog/how-to-create-a-slug-system-in-strapi-v4_
