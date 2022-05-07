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