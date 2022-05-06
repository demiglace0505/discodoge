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
