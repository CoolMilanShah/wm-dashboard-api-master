import db, { transaction } from '../adapters/index';
//async function getData() {
async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);
  let whereClause = 'expense_date is not null';

  if (params.Branch.search('Select')) {
    whereClause += ` and branch='${params.Branch}'`;
  }
  const category = await db.query(
    `Select distinct expense_category_name as expensecategory  from expenses`,
  );

  const data = await db.query(
    `Select id, to_char( expense_date, 'MON-YYYY') as expensedate, expense_category_name as expensecategory,
     expense_amount as amount, remarks, created_date_time as createdatetime,branch from expenses where ${whereClause}`,
  );

  return { data: data.rows, category: category.rows };
}

async function insertData(params) {
  const {
    expensedate,
    expensecategory,
    amount,
    remarks,
    createdatetime,
    Branch,
  } = params;
  const queryText =
    'INSERT INTO expenses(expense_category_name, expense_date, expense_amount, remarks, created_date_time,Branch) VALUES ($1, $2, $3, $4, $5,$6)';
  const result = await transaction(queryText, [
    expensecategory,
    expensedate,
    amount,
    remarks,
    createdatetime,
    Branch,
  ]);
  return result;
}

async function updateData(params) {
  const {
    expensecategory,
    expensedate,
    amount,
    id,
    remarks,
    createdatetime,
    Branch,
  } = params;

  const queryText = `update expenses set expense_amount = $1, created_date_time = $5, remarks = $6 where expense_category_name = $2 and to_char(expense_date, 'MON-YYYY') = $3 and id = $4`;
  const result = await transaction(queryText, [
    amount,
    expensecategory,
    expensedate,
    id,
    createdatetime,
    remarks,
  ]);
  return result;
}

async function deleteData(params) {
  const { expensecategory, expensedate, amount, id } = params;
  const queryText = `delete from  expenses where expense_category_name = ANY($1) and to_char(expense_date, 'MON-YYYY') = ANY($2) and expense_amount = ANY($3) and id = ANY($4)`;
  const result = await transaction(queryText, [
    expensecategory,
    expensedate,
    amount,
    id,
  ]);
  return result;
}

export default async function (request) {
  switch (request.method) {
    case 'GET':
      return getData(request.query);
    //return getData();
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
