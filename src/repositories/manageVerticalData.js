import db, { transaction } from "../adapters/index";

async function getData() {
  const data = await db.query(
    `Select distinct vertical_name as vertical from vertical where vertical_name is not null order by vertical_name`
  );
  return data.rows;
}

async function insertData(params) {
  const { vertical } = params;
  const queryText = "INSERT INTO vertical(vertical_name) VALUES ($1)";
  const result = await transaction(queryText, [vertical]);
  return result;
}

async function updateData(params) {
  const { vertical } = params;
  const queryText =
    "update vertical set vertical_name=$1 where vertical_name=$2";
  const result = await transaction(queryText, [
    params["new vertical"],
    vertical
  ]);
  return result;
}

async function deleteData(params) {
  const { vertical } = params;
  const queryText = "delete from  vertical  where vertical_name=ANY($1)";
  const result = await transaction(queryText, [vertical]);
  return result;
}

export default async function (request) {
  switch (request.method) {
    case "GET":
      return getData();
    case "POST":
      return insertData(request.body);
    case "PUT":
      return updateData(request.body);
    case "DELETE":
      return deleteData(request.body);
    default:
      return { Error: "Not Supported Action" };
  }
}
