import db, { transaction } from '../adapters/index';

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);
  let whereClause = 'date is not null and vendor is not null';

  if (params.Branch.search('Select')) {
    whereClause += ` and branch='${params.Branch}'`;
  }

  const data = await db.query(
    `Select distinct id, to_char(date, 'MON-YYYY') as date, vendor, aum, sip,created_date_time as createdatetime ,branch from aum where ${whereClause}`,
  );

  return data.rows;
}

async function insertData(params) {
  const { date, vendor, aum, sip, createdatetime, Branch } = params;
  const queryText =
    'INSERT INTO aum(date, vendor, aum, sip, created_date_time,Branch) VALUES ($1, $2, $3, $4, $5,$6)';
  const result = await transaction(queryText, [
    date,
    vendor,
    aum,
    sip,
    createdatetime,
    Branch,
  ]);
  return result;
}

async function updateData(params) {
  const { date, vendor, aum, sip, id, createdatetime } = params;
  const queryText = `update aum set aum=$1, sip= $2, created_date_time=$6 where vendor=$3 and to_char(date, 'MON-YYYY')=$4 and id=$5`;
  const result = await transaction(queryText, [
    aum,
    sip,
    vendor,
    date,
    id,
    createdatetime,
  ]);
  return result;
}

async function deleteData(params) {
  const { date, vendor, aum, sip, id } = params;
  const queryText = `delete from  aum where vendor=ANY($1) and to_char(date, 'MON-YYYY')=ANY($2) and aum=ANY($3) and sip=ANY($4) and id=ANY($5)`;
  const result = await transaction(queryText, [vendor, date, aum, sip, id]);
  return result;
}

export default async function (request) {
  switch (request.method) {
    case 'GET':
      return getData(request.query);
    case 'POST':
      return insertData(request.body);
    case 'PUT':
      return updateData(request.body);
    case 'DELETE':
      return deleteData(request.body);
    default:
      return { Error: 'Not Supported Action' };
  }
}
