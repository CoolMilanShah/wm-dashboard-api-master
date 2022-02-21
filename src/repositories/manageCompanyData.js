import db, { transaction } from "../adapters/index";

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);
  let whereClause = "where company is not null";

  if (params && params.Verticals.search("Select")) {
    whereClause += ` and vertical_name='${params.Verticals}'`;
    if (params["Sub-Verticals"] && params["Sub-Verticals"].search("Select")) {
      whereClause += ` and sub_vertical_name='${params["Sub-Verticals"]}'`;
    }
    if (params.Vendors && params.Vendors.search("Select")) {
      whereClause += ` and vendor='${params.Vendors}'`;
    }
  }

  const data = await db.query(
    `Select distinct vertical_name as vertical, sub_vertical_name as "sub-vertical", vendor, company from vertical  ${whereClause} order
     by vertical_name`
  );
  return data.rows;
}

async function insertData(params) {
  const { company, Vendors, Verticals } = params;
  const queryText =
    "INSERT INTO vertical(vertical_name, sub_vertical_name, vendor, company) VALUES ($1, $2, $3, $4)";
  const result = await transaction(queryText, [
    Verticals,
    params["Sub-Verticals"],
    Vendors,
    company
  ]);
  return result;
}

async function updateData(params) {
  const { company, vendor, vertical } = params;

  const queryText = `update vertical set company=$1 where company=$2 and vertical_name=$3 and sub_vertical_name=$4 and vendor=$5`;
  const result = await transaction(queryText, [
    params["new company"],
    company,
    vertical,
    params["sub-vertical"],
    vendor
  ]);
  return result;
}

async function deleteData(params) {
  const { company, vendor, vertical } = params;

  const queryText = `delete from  vertical  where company=ANY($1) and vertical_name=ANY($2) and sub_vertical_name=ANY($3) and vendor=ANY($4)`;
  const result = await transaction(queryText, [
    company,
    vertical,
    params["sub-vertical"],
    vendor
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
