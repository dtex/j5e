#!/usr/bin/env node

import fs from 'fs';

fs.readFileSync('./package.json', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});