import db, { transaction } from "../adapters/index";

async function getData() {
  const data = await db.query(
    `Select branch_name as branch from branch`
  );
  return data.rows;
}

export default async function (request) {
  switch (request.method) {
    case "GET":
      return getData();
    default:
      return { Error: "Not Supported Action" };
  }
}
