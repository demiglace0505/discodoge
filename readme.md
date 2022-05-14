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
  const json = await res.json();
  const events = json.data;

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

## Deleting Event

```javascript
const deleteEvent = async (e) => {
  if (confirm("Are you sure?")) {
    const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
      method: "DELETE",
    });
    const data = res.json();

    if (!res.ok) {
      toast.error(data.message);
    } else {
      router.push("/events");
    }
  }
};
```

## Editing Events

For editing an event, we first need to load the event data using getServerSideProps

```javascript
export async function getServerSideProps({ params: { id } }) {
  const res = await fetch(`${API_URL}/api/events/${id}?populate=*`);
  const json = await res.json();
  const evt = json.data;

  return {
    props: {
      evt,
    },
  };
}
```

Using moment library, we can populate the date field properly.

```javascript
<div>
  <label htmlFor="date">Date</label>
  <input
    type="date"
    name="date"
    id="date"
    value={moment(values.date).format("yyyy-MM-DD")}
    onChange={handleInputChange}
  />
</div>
```

```javascript
function EditEventPage({ evt }) {
  const attributes = evt.attributes;
  const [values, setValues] = useState({
    name: attributes.name,
    performers: attributes.performers,
    venue: attributes.venue,
    address: attributes.address,
    date: attributes.date,
    time: attributes.time,
    description: attributes.description,
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

    const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
      method: "PUT",
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

  return ()
}
```

## Image Preview and Modal

We can implement a thumbnail preview using useState hooks

```javascript
const [imagePreview, setImagePreview] = useState(
  attributes.image
    ? attributes.image.data.attributes.formats.thumbnail.url
    : null
);

<h2>Event Image</h2>;
{
  imagePreview ? (
    <Image src={imagePreview} height={100} width={170} />
  ) : (
    <div>
      <p>No image uploaded</p>
    </div>
  );
}
```

For the Modal component, we will be basing on the [writeup by Alexander Rusev](https://devrecipes.net/modal-component-with-next-js/). The modal component is server side rendered. When the component first renders, we don't have access to the document object yet. The workaround is to use an effect and state hook to initialize the modal. In next.js, we don't have an access to an index.html in the `public` directory, hence we need to use a custom [Document object](https://nextjs.org/docs/advanced-features/custom-document), `pages/_document.js`.

Here we add the div with an id `modal-root`

```javascript
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <div id="modal-root"></div>
        </body>
      </Html>
    );
  }
```

Afterwards we create the modal component

```javascript
function Modal({ show, onClose, children, title }) {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => setIsBrowser(true));

  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };

  const modalContent = show ? (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <a href="#" onClick={handleClose}>
            <FaTimes />
          </a>
        </div>
        {title && <div>{title}</div>}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return reactDom.createPortal(
      modalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
}
```

**another solution without using portal, using css overflow**

```javascript
function Modal({ show, onClose, children, title }) {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <a href="#" onClick={handleClose}>
            <FaTimes />
          </a>
        </div>

        {!!title && <h3>{title}</h3>}

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
```

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  overflow-x: hidden;
  overflow-y: auto;
}
```

We can now use the modal component in our `events/edit/[id]` file.

```javascript
<Modal show={showModal} onClose={() => setShowModal(false)}>
  <ImageUpload evtId={evt.id} imageUploaded={imageUploaded} />
</Modal>
```

The ImageUpload component would look like the following:

```javascript
function ImageUpload({ evtId, imageUploaded }) {
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("files", image);
    formData.append("ref", "api::event.event"); // name of the model which the image we are uploading will be linked to
    formData.append("refId", evtId); // indicates the specific event which the image will be linked to
    formData.append("field", "image");

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      imageUploaded();
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className={styles.form}>
      <h1>Upload Event Image</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.file}>
          <input type="file" onChange={handleFileChange} />
        </div>
        <input type="submit" value="Upload" className="btn" />
      </form>
    </div>
  );
}
```

And in the [id].js component, we use the following ImageUploaded callback function which sets the thumbnail from the uploaded image.

```javascript
const imageUploaded = async (e) => {
  const res = await fetch(`${API_URL}/api/events/${evt.id}?populate=*`);
  const json = await res.json();
  const data = json.data;
  // console.log("Image Uploaded. Response Data:", data);
  setImagePreview(data.attributes.image.data.attributes.formats.thumbnail.url);
  setShowModal(false);
};
```

## Pagination

To add pagination to the events page, we can use the [Strapi Pagination api](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html#pagination). We will need to return the page number, and the total events in addition to the events data.

```javascript
// config/index.js
export const PER_PAGE = 4;
```

```javascript
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
```

The total and page props will be used for adding the pagination button links in our events page. We can create a new Pagination.js component wherein we pass the page and total props

```javascript
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
```

```javascript
function Pagination({ page, total }) {
  const lastPage = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Button to Previous Page */}
      {page > 1 && (
        <Link href={`/events?page=${page - 1}`}>
          <a className="btn-secondary">Prev</a>
        </Link>
      )}

      {/* Button to Next Page */}
      {page < lastPage && (
        <Link href={`/events?page=${page + 1}`}>
          <a className="btn-secondary" style={{ float: "right" }}>
            Next
          </a>
        </Link>
      )}
    </div>
  );
}
```

## Authentication

### Setting up Context

Using Context, we can manage the functions for logging in, registering etc. We start with creating an `auth/AuthContext.js` component using createContext api. We will need to create a context provider which will wrap our app to provide the context.

```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // register user
  const register = async (user) => {
    console.log(user);
  };

  // login user
  const login = async ({ email: identifier, password }) => {
    console.log(identifier, password);
  };

  // logout user
  const logout = async () => {
    console.log("logout");
  };

  // check if user is logged in (persist)
  const checkUserLoggedIn = async () => {
    console.log("check user");
  };

  return (
    <AuthContext.Provider value={{ user, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
```

We will then bring in the context to our \_app.js.

```javascript
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />;
    </AuthProvider>
  );
}
```

We can then use the context in various component of our app using the useContext react hook.

```javascript
function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      {user ? (
        // if logged in
        <div>
          <li>
            <Link href="/events/add">
              <a>Add Event</a>
            </Link>
          </li>
        </div>
      ) : (
        // if logged out
        <>
          <li>
            <Link href="/account/login">
              <a className="btn-secondary btn-icon">
                <FaSignInAlt /> Login
              </a>
            </Link>
          </li>
        </>
      )}
    </div>
  );
}
```

```javascript
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };
```

```javascript
function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { register, error } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    register({ username, email, password });
  };
```

### JWT

Strapi has JWT token authentication built in wherein we send the username password and Strapi gives us a token that we use for requests. We will not be using client side cookies since it is not the safest, instead we will be using api routes within strapi. These routes can be accessed to make requests to Strapi, get the token, and set a serverside cookie using HttpOnly.

To login to strapi, we send a request to `/auth/local` endpoint. Strapi returns a jwt token along the user data.

### Logging in and Getting JWT

We start by creating an api route to connect to, and from there communicate with Strapi to get the token. This will allow us to use HttpOnly cookies later on.

```javascript
export default async (req, res) => {
  if (req.method === "POST") {
    // login logic here
    const strapiRes = await fetch(`${API_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: req.body,
    });

    const data = await strapiRes.json();
    console.log("next login data", data);
    console.log("JWT:", data.jwt);

    if (data.data !== null) {
      // @todo set cookie
      res.status(200).json({ user: data.user });
    } else {
      res.status(data.error.status).json({ error: data.error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
```

We can then update the login() method in our AuthContext:

```javascript
const login = async ({ email: identifier, password }) => {
  const res = await fetch(`${NEXT_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "json/application",
    },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await res.json();
  console.log("Auth Context Login", data);

  if (res.ok) {
    setUser(data.user);
  } else {
    setError(data.error);
  }
};
```

At this point, to register a new user, we can make a POST request to the endpoint `http://localhost:1337/api/auth/local/register` and send in a json in the body.

```json
{
  "username": "testdoge",
  "email": "testdoge@doge.com",
  "password": "testdoge"
}
```

### Storing JWT in HttpOnly Cookie

To set cookies, we will be using the package cookie. We will be doing it serverside from our `/api/login.js` using **cookie.serialize()** wherein we name our cookie as _token_ and set it as the jwt returned. The options object will have a _secure_ flag which will be https when in production, and http when in development.

```javascript
if (data.data !== null) {
  // set cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({ user: data.user });
}
```

We can access the cookie in our getServerSideProps through the **req** object. This cookie is not accessible in the client side and is only available server side, but we can pass it as a prop to the page.

```javascript
export async function getServerSideProps({ params: { id }, req }) {
  const res = await fetch(`${API_URL}/api/events/${id}?populate=*`);
  const json = await res.json();
  const evt = json.data;

  console.log(req.headers.cookie);

  return {
    props: {
      evt,
    },
  };
}
```

### Persisting Logged in User

We start by creating a new api route `/api/user.js` which will send the token from our httpOnly cookie to the Strapi api endpoint `/api/users/me` and get back the user from that token.

```javascript
export default async (req, res) => {
  if (req.method === "GET") {
    if (!req.headers.cookie) {
      res.status(403).json({ message: "Not Authorized" });
      return;
    }

    const { token } = cookie.parse(req.headers.cookie);
    const strapiRes = await fetch(`${API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await strapiRes.json();

    if (strapiRes.ok) {
      res.status(200).json({ user });
    } else {
      res.status(403).json({ message: "User Forbidden" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
```

We can now hit this endpoint with our AuthContext using an effect hook

```javascript
useEffect(() => checkUserLoggedIn(), []);

const checkUserLoggedIn = async () => {
  const res = await fetch(`${NEXT_URL}/api/user`);
  const data = await res.json();

  if (res.ok) {
    setUser(data.user);
  } else {
    setUser(null);
  }
};
```

### Logout and Destroying Cookies

For logout, we will be creating another api route `/api/logout.js` because we need to destroy the httpOnly cookie serverside.

```javascript
export default async (req, res) => {
  if (req.method === "POST") {
    // destroy cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        expires: new Date(0),
        sameSite: "strict",
        path: "/",
      })
    );

    res.status(200).json({ message: "Cookie Destroyed" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
```

And in our AuthContext, we can implement the logout method.

```javascript
const logout = async () => {
  const res = await fetch(`${NEXT_URL}/api/logout`, {
    method: "POST",
  });

  if (res.ok) {
    setUser(null);
    router.push("/");
  }
};
```
