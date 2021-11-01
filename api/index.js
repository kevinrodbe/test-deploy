const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { resolvers, typeDefs } = require("./schema");
const jwt = require("express-jwt");

// this is not secure! this is for dev purposes
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "5c387e3e270861eb4f64d7c4421891a551a16c92a3a0f799e4c882414228b33aa3d74388a0836886fdcdbcbe31fd0949535a75fa3571a6441032b0059f7e04aa";

const PORT = process.env.PORT || 3500;
const app = express();
const { categories } = require("./db.json");

app.use(cors());

// auth middleware
const auth = jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false
});

require("./adapter");

const server = new ApolloServer({
  introspection: true, // do this only for dev purposes
  playground: true, // do this only for dev purposes
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const { id, email } = req.user || {};
    return { id, email };
  }
});

app.use(auth);

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { status } = err;
  res.status(status).json(err);
};
app.use(errorHandler);
server.applyMiddleware({ app, path: "/graphql" });

app.get("/categories", function(req, res) {
  res.send(categories);
});

if (!process.env.NOW_REGION) {
  app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/graphql`);
  });
}

module.exports = app;
