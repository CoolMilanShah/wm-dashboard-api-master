import db from "../adapters/index";

async function getData({ filterValue }) {
  const filterval = JSON.parse(filterValue);

  let whereClause = "where ";
  switch (Object.keys(filterval)) {
    case "SubVerticalType":
      whereClause += `sub_vertical_name='${filterval.SubVerticalType}'`;
      break;
    case "VendorType":
      whereClause += `vendor='${filterval.VendorType}'`;
      break;
    case "CompanyType":
      whereClause += `company='${filterval.CompanyType}'`;
      break;
    default:
      break;
  }
  const data = await db.query(
    `Select distinct vertical_name as verticaltype from vertical  ${whereClause} `
  );

  return data.rows;
}

export default async function(request) {
  switch (request.method) {
    case "GET":
      return getData(request.query);

    default:
      return { Error: "Not Supported Action" };
  }
}
