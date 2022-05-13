import { API_URL } from "@/config/index";

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
