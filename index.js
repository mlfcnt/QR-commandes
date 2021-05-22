const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password, Relationship, Integer, Float } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
// require('dotenv').config();

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'QR-commandes';
const adapterConfig = {
  mongoUri: process.env.MONGO_URI,
};

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = (auth) => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});

keystone.createList('Business', {
  fields: {
    name: { type: Text },
    managers: { type: Relationship, ref: 'User', many: true },
    menus: { type: Relationship, ref: 'Menu', many: true },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});

keystone.createList('Menu', {
  fields: {
    name: { type: Text },
    articles: { type: Relationship, ref: 'Article', many: true },
    isActive: { type: Checkbox, defaultValue: true },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});
keystone.createList('Article', {
  fields: {
    name: { type: Text },
    volumes: { type: Relationship, ref: 'Volume', many: true },
    prices: { type: Relationship, ref: 'ArticlePriceVolume', many: true },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});
keystone.createList('ArticlePriceVolume', {
  fields: {
    article: { type: Relationship, ref: 'Article', many: false },
    volume: { type: Relationship, ref: 'Volume', many: false },
    price: { type: Float },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});
keystone.createList('Volume', {
  fields: {
    volume: { type: Integer },
    unit: { type: Text },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});

keystone.createList('Table', {
  fields: {
    name: { type: Text },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});

keystone.createList('Order', {
  fields: {
    business: { type: Relationship, ref: 'Business', many: false },
    articles: { type: Relationship, ref: 'Article', many: true },
    quantities: { type: Relationship, ref: 'Quantity', many: true },
    table: { type: Relationship, ref: 'Table', many: false },
    isFinished: { type: Checkbox, defaultValue: false },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});

keystone.createList('Quantity', {
  fields: {
    article: { type: Relationship, ref: 'Article', many: false },
    quantity: { type: Integer },
    volume: { type: Relationship, ref: 'Volume', many: false },
  },
  // List-level access controls
  access: {
    auth: true,
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: process.env.NODE_ENV === 'production' },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
