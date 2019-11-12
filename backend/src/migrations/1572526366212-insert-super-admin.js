/**
 * Make any changes you need to make to the database here
 */
// -------- THE SHEMA NAME ------------
const modelName = 'User';
// -------- THE ENTIRIES TO INSERT
const entities = [
  {
    firstName: `super`,
    lastName: `admin`,
    email: 'superadmin@conlego.com',
    password: `superadmin`,
    role: `superadmin`
  }
];
async function up () {
  // Write migration here
  try {
    // INSERT THE ENTITIES
    await this(modelName).insertMany(entities);
  } catch (e) {
    console.error('add-super-admin ERROR ' + e);
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  // Write migration here
}

module.exports = { up, down };
