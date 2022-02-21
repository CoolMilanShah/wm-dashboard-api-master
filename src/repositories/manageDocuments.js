import db, { transaction } from '../adapters/index';

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause = ` where client_name='${params.clientname}'`;

  if (params.category && params.category.search('Select')) {
    whereClause += ` and document_category='${params.category}'`;
  }
  if (params.pan && params.pan.search('Select')) {
    whereClause += ` and pan_no='${params.pan}'`;
  }

  const data = await db.query(
    `select distinct client_name as clientname, pan_no as pan, document_category as category, file_name as filename, s3_url as s3url, created_date_time as createdatetime from documents ${whereClause}`,
  );

  return data.rows;
}

async function insertData(params) {
  const { name, category, pan, s3url, filename, createdatetime } = params;

  const queryText = `INSERT INTO documents(client_name, document_category, pan_no, s3_url, file_name, created_date_time)
    VALUES ($1, $2, $3, $4, $5, $6)`;
  const result = name.map(async (element, index) => {
    await transaction(queryText, [
      element,
      category[index],
      pan[index],
      s3url[index],
      filename[index],
      createdatetime[index],
    ]);
  });
  const resp = await Promise.all(result);
  return resp;
}

async function deleteData(params) {
  const { clientname, category, pan, filename } = params;

  const queryText = `delete from  documents where client_name=ANY($1) and document_category=ANY($2) and
                        pan_no=ANY($3) and file_name=ANY($4)`;
  const result = await transaction(queryText, [
    clientname,
    category,
    pan,
    filename,
  ]);
  return result;
}

export default async function(request) {
  switch (request.method) {
    case 'GET':
      return getData(request.query);
    case 'POST':
      return insertData(request.body);
    case 'DELETE':
      return deleteData(request.body);
    default:
      return { Error: 'Not Supported Action' };
  }
}
