# conlego
A MEAN fullstack integrated with docker.

## Integration Features

- [x] Orchestrate services with docker-compose
- [x] Zero dependency for dev/prod (except docker installation)
- [ ] Add Elasticsearch / Kibana for log dashboard
- [ ] Add Redis



## Backend Features

- [x] Automate and enhance workflows ([Gulp](https://gulpjs.com/))
  - [x] Separated environments (dev/prod)
  - [x] Typescript compilation
  - [x] Watch changes at development only
  - [x] Copy asset files

- [x] Global configuration file
  - [x] Get env variables

- [ ] Logger
  - [x] Use official logger ([Winston](https://github.com/winstonjs/winston))
  - [x] Write logs to files
  - [x] Write logs to console
  - [ ] Write logs to elasticsearch in order to use [Kibana](https://www.elastic.co/products/kibana) dashboard

- [ ] Databases
  - [x] Mongodb adapter
  - [ ] Migrations
  - [ ] Seeds
  
- [x] Redis adapter

- [ ] Resource Controller
  - [x] Generic resource controller for exposing CRUD API
    - [x] Optional CRUD operation
    - [x] Dynamic middleware per route
  - [x] Paginated resource lists
    - [ ] ? Disable pagination on demand by query param
  - [ ] External Validation handler
  - [ ] An efficient way for API caching

- [x] Generic query parser
  - [x] Applicable at resource lists
  - [x] Applicable at getting single resource

- [ ] Mongoose model factory
  - [x] Create dynamic mongoose models based on typescript classes
  - [x] Hidden properties of model from API
  - [x] Readonly properties of model from API
  - [x] Unique validation of properties
  - [ ] Test Virtual population with Typegoose

- [ ] OAuth implementation
  - [x] Password grand type
  - [x] Refresh token grand type
  - [x] Client credentials grand type
  - [ ] Authorization code grand type
  - [ ] A better authorization middleware in order to check user roles

- [ ] Sockets
  - [ ] TODO: write features

- [ ] User notifications
  - [ ] Implement a sophisticated way to manage notifications
  - [ ] Send notification to user/user groups
  - [ ] Find an efficient way to manage them from client
