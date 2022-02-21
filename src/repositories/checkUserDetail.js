import db from '../adapters/index';

export default async function checkUser({ body }) {

  const data = await db.query(
    `Select admin from user_detail where email='${body.email}' and password='${body.password}'`,
  );

  return data.rows;
}

/*
export default async function checkUser({ body }) {
  if (err)
    return console.error('error fetching client from pool', err);

  var data = db.query("Select 1 + 1", function (err, result) {
    //this callback never fires for some queries
    if (err)
      return console.error('error running query', err);

    console.log(result.rows[0].number);
  });
  data.on('end', function () {
    //This event callback always fires
    console.log('Finished with query');
  });

  return 1;
  done();
}
*/