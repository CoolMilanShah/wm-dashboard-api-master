import db, { transaction } from "../adapters/index";

async function getData({ filterValue }) {
  const { Verticals } = JSON.parse(filterValue);

  let whereClause = "where sub_vertical_name is not null";

  if (Verticals && Verticals.search("Select")) {
    whereClause += ` and vertical_name='${Verticals}'`;
  }

  const data = await db.query(
    `Select distinct vertical_name as vertical , sub_vertical_name as "sub-vertical" from vertical  ${whereClause} order by vertical_name`
  );
  return data.rows;
}

async function insertData(params) {
  const queryText =
    "INSERT INTO vertical(vertical_name, sub_vertical_name) VALUES ($1, $2)";
  const result = await transaction(queryText, [
    params.Verticals,
    params["sub-vertical"]
  ]);
  return result;
}

async function updateData(params) {
  const queryText = `update vertical set sub_vertical_name=$1 where sub_vertical_name=$2  and vertical_name=$3`;
  const result = await transaction(queryText, [
    params["new sub-vertical"],
    params["sub-vertical"],
    params.vertical
  ]);
  return result;
}

async function deleteData(params) {
  const queryText = `delete from  vertical where sub_vertical_name=ANY($1) and vertical_name=ANY($2)`;
  const result = await transaction(queryText, [
    params["sub-vertical"],
    params.vertical
  ]);
  return result;
}

export default async function(request) {
  switch (request.method) {
    case "GET":
      return getData(request.query);
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
