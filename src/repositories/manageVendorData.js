import db, { transaction } from "../adapters/index";

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause = "where vendor is not null ";

  if (params && params.Verticals.search("Select")) {
    whereClause += ` and vertical_name='${params.Verticals}'`;
    if (params["Sub-Verticals"] && params["Sub-Verticals"].search("Select")) {
      whereClause += ` and sub_vertical_name='${params["Sub-Verticals"]}'`;
    }
  }

  const data = await db.query(
    `Select distinct vertical_name as vertical, sub_vertical_name as "sub-vertical", vendor as vendor from vertical
    ${whereClause} order by vertical_name`
  );

  return data.rows;
}

async function insertData(params) {
  const { vendor, Verticals } = params;
  const queryText =
    "INSERT INTO vertical(vertical_name, sub_vertical_name, vendor) VALUES ($1, $2,$3)";
  const result = await transaction(queryText, [
    Verticals,
    params["Sub-Verticals"],
    vendor
  ]);
  return result;
}

async function updateData(params) {
  const { vendor, vertical } = params;

  const queryText = `update vertical set vendor=$1 where vendor=$2 and vertical_name=$3 and sub_vertical_name=$4`;
  const result = await transaction(queryText, [
    params["new vendor"],
    vendor,
    vertical,
    params["sub-vertical"]
  ]);
  return result;
}

async function deleteData(params) {
  const { vendor, vertical } = params;

  const queryText = `delete from  vertical  where vendor=ANY($1) and vertical_name=ANY($2) and sub_vertical_name=ANY($3)`;
  const result = await transaction(queryText, [
    vendor,
    vertical,
    params["sub-vertical"]
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
