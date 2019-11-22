const COLLECTION_NAME = 'User';
const ENTITIES = [
  {
    "firstName": "Superadmin",
    "lastName": "SuperAdministrator",
    "email": "superadmin@conlego.com",
    "password": "superadmin"
  },
  {
    "firstName": "Admin",
    "lastName": "Administrator",
    "email": "admin@fullstack.com",
    "password": "admin"
  }
];

/**
 * Create essential entities
 */
async function up() {
  const EntityModel = this(COLLECTION_NAME);

  for (let i = 0; i < ENTITIES.length; i++) {
    const entity = ENTITIES[i];

    // find if entity exists
    const foundEntity = await EntityModel.findOne({ email: entity.email })

    // if not exists then add it
    if (!foundEntity) { await EntityModel.create(entity); }
  }
}

/**
 * Remove essential entities
 */
async function down() {
  const EntityModel = this(COLLECTION_NAME);

  for (let i = 0; i < ENTITIES.length; i++) {
    const entity = ENTITIES[i];

    // find if entity exists
    await EntityModel.deleteOne({ email: entity.email })
  }
}

module.exports = { up, down };
