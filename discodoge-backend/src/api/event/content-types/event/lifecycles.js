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
