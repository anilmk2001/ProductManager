const app = require('./app.js');
const PORT = 8000;

/**
 * Method which keep server running
 */
 app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
