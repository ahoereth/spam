import {
  range, isArray, sum, map, trimEnd, repeat, parseInt, isNull, clone,
  indexOf, max, flow, partialRight, groupBy, sortBy, partial,
} from 'lodash-es';


function buildColumns(userdetails, fields, columncount = 3) {
  let order = userdetails.overview_order;
  let division = clone(userdetails.overview_columns);

  // Order might be set by the user.
  if (isNull(order) || order.length !== fields.length) {
    order = range(0, fields.length);
  }

  // Column division might be hard set by the user.
  if (
    !isArray(division) ||
    division.length !== columncount ||
    sum(division) !== fields.length
  ) {
    const height = Math.ceil(fields.length / columncount);
    division = map(
      trimEnd(repeat(`${height}|${columncount}`), '|').split('|'), parseInt,
    );
  }

  // Create grouped object.
  const obj = flow(
    partialRight(map, f => { // Add 'pos' attribute.
      const pos = indexOf(order, f.field_id);
      f.pos = pos !== -1 ? pos : 0;
      return f;
    }),
    partialRight(sortBy, 'pos'), // Sort by position initially.
    partialRight(groupBy, f => { // Group into columns.
      let col = f.pos % columncount;
      while (division[col] <= 0) {
        col = (col + 1) % columncount;
        if (col === (f.pos % columncount)) { break; } // All full.
      }
      division[col] -= 1;
      return col;
    }),
  )(fields);

  // Create column array from grouped object.
  return map(division, (n, i) => obj[i] || []);
}


function refreshOrder(userdetails, columns) {
  const columnheights = map(columns, 'length');
  const maxheight = max(columnheights);

  const order = [];
  for (let row = 0; row < maxheight; row++) {
    for (let col = 0; col < columns.length; col++) {
      if (row < columns[col].length) {
        order.push(columns[col][row].field_id);
      }
    }
  }

  userdetails.one('regulations', userdetails.regulation_id).customPUT({
    overview_order: order,
    overview_columns: columnheights,
  });

  return order;
}


const breakpoints = [750, 970, 1170];


export default ['$window', 'User', ($window, User) => ({
  breakpoints,
  build: partial(buildColumns, User.details),
  refresh: partial(refreshOrder, User.details),
})];
