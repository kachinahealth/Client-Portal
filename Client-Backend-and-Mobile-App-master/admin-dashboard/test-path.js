const path = require('path');
console.log('Current directory:', process.cwd());
console.log('Leaderboard to lib:', path.relative('pages/api/company/[companyId]', 'lib'));
console.log('News item to lib:', path.relative('pages/api/company/[companyId]/news', 'lib'));
