const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
app.set('port', PORT);
app.listen(app.get('port'), () => {
  logger.info(`Server is running on port ${PORT}`);
});
