import db from "../adapters/index";

export default async function get(params) {
  let whereClause = [];
  let count = 1;
  const whereClauseValue = Object.keys(params).map(paramvar => {
    if (params[paramvar]) {
      whereClause.push(`${paramvar}=$${count}`);
      count += 1;
    }
    return params[paramvar] ? params[paramvar] : null;
  });

  if (whereClause.length > 0) {
    whereClause = `where ${whereClause.join(" and ")}`;
  }

  const data = await db.query(
    `Select  csd.servicename, cd.couponcode, cd.couponlink, cd.description, cd.shortdescription
    from coupondetails cd left join couponservicedetail csd on cd.serviceid=csd.serviceid
    left join couponcategories cc on cd.categoryid=cc.categoryid
     ${whereClause}  order by cd.enddate, cd.city, cd.state, cd.country`,
    whereClauseValue.filter(Boolean)
  );
  return data.rows;
}
