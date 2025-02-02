const DButils = require("./DButils");

async function getFamilyMembers(family_id) {
  const members = await DButils.execQuery(
    `select user_id from user_family where family_id='${family_id}' `
  );
  return members;
}

async function getFamilyMembersInfo(array_user_id) {
  array_user_id = array_user_id.map((user) => user.user_id);
  const members = await DButils.execQuery(
    `select username,firstname,lastname,email from users where user_id in (${array_user_id})`
  );
  return members;
}

async function addFamily(family_name) {
  const results = await DButils.execQuery(
    `INSERT INTO family (name) VALUES ('${family_name}')`
  );
  return results.insertId;
}

async function addFamilyMember(user_id, family_id, isAdd) {
  if (isAdd) {
    await DButils.execQuery(
      `INSERT INTO user_family (user_id,family_id) VALUES ('${user_id}','${family_id}')`
    );
  } else {
    await DButils.execQuery(
      `DELETE FROM user_family WHERE user_id='${user_id}' and family_id='${family_id}'`
    );
  }
}
async function getMyFamilis(user_id) {
  const familis = await DButils.execQuery(
    `select family_id from user_family where user_id='${user_id}'`
  );
  return familis;
}
async function searchFamily(family_name) {
  // const familis = await DButils.execQuery(
  //   `select * from family where lower(name) like lower('${family_name}%')`
  // );
  const familis = await DButils.execQuery(
    `select family_id,name from family order by levenshtein(name,'${family_name}') limit 5`
  );
  return familis;
}
async function getFamilisName(family_ids) {
  const familyIds = family_ids.map((family) => family.family_id);
  const familis = await DButils.execQuery(
    `select family_id,name from family where family_id in (${familyIds})`
  );
  return familis;
}

async function createFamilyRecipe(family_id, id, data, isAdd) {
  try {
    if (isAdd) {
      await DButils.execQuery(
        `INSERT INTO recipe_family (family_id,id,data) VALUES ('${family_id}','${id}','${data}')`
      );
    } else {
      await DButils.execQuery(
        `DELETE FROM recipe_family WHERE family_id='${family_id}' and id='${id}'`
      );
    }
  } catch (error) {
    if (error.errno == 1062 && isAdd) {
      throw { status: 409, message: "Recipe already in family" };
    } else {
      throw error;
    }
  }
}

async function getFamilyRecipes(family_id) {
  const recipes = await DButils.execQuery(
    `select id from recipe_family where family_id='${family_id}'`
  );
  return recipes;
}
async function getFamilyRecipesInfo(recipes_id_array, family_id) {
  recipes_id_array = recipes_id_array.map((recipe) => recipe.id);

  recipes = await DButils.execQuery(
    `select recipes.*, recipe_family.*, users.firstname , users.lastname  from recipes inner join recipe_family on recipes.id=recipe_family.id join users on recipes.user_id=users.user_id where recipes.id in (${recipes_id_array}) and recipe_family.family_id='${family_id}'`
  );
  return recipes;
}

exports.getFamilyMembers = getFamilyMembers;
exports.getFamilyMembersInfo = getFamilyMembersInfo;
exports.addFamily = addFamily;
exports.addFamilyMember = addFamilyMember;
exports.getMyFamilis = getMyFamilis;
exports.getFamilisName = getFamilisName;
exports.createFamilyRecipe = createFamilyRecipe;
exports.getFamilyRecipes = getFamilyRecipes;
exports.searchFamily = searchFamily;
exports.getFamilyRecipesInfo = getFamilyRecipesInfo;
