/* eslint-disable array-callback-return */
import db from '../adapters/index';

async function getClientData() {
  const data = await db.query(
    `select  distinct full_name as name, to_char(dob, 'YYYY-MM-DD') as dob from clients where full_name is not null order by full_name`,
  );
  return data.rows;
}
async function getClientPan() {
  const data = await db.query(
    `select  distinct full_name as name, pan_no as pan from clients where full_name is not null order by full_name`,
  );
  return data.rows;
}

async function getFamilyData() {
  const data = await db.query(
    `select distinct family from clients where family is not null order by family`,
  );
  return data.rows;
}

async function getTermDepositData() {
  const data = await db.query(
    `Select distinct product_type as producttype from term_deposit where product_type is not null order by product_type`,
  );

  return data.rows;
}

async function getInsuraceDetailData({ filterValue }) {
  const { subvertical } = JSON.parse(filterValue);
  let whereClause = '';
  if (subvertical.search('Select')) {
    whereClause += ` and sub_vertical_name='${subvertical}'`;
  }
  const data = await db.query(
    `Select distinct plan_type as plantype from insurance where plan_type is not null ${whereClause} order by plan_type`,
  );

  return data.rows;
}

async function getDocumentCategory() {
  const data = await db.query(
    `Select distinct document_category as category from documents where document_category is not null order by document_category`,
  );

  return data.rows;
}

export default async function(request) {
  const { type } = JSON.parse(request.query.filterValue);

  switch (type) {
    case 'client':
      return getClientData(request.query);
    case 'producttype':
      return getTermDepositData(request.query);
    case 'plantype':
      return getInsuraceDetailData(request.query);
    case 'family':
      return getFamilyData(request.query);
    case 'pan':
      return getClientPan(request.query);
    case 'documentcategory':
      return getDocumentCategory(request.query);

    default:
      return { Error: 'Not Supported Action' };
  }
}
