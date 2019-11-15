const { Pool } = require('pg')
const pool = new Pool({connectionString: 'postgres://etllmjcn:SDloI1WqLlW9ZyI6xgw1zpn5MnHGzSfG@tuffi.db.elephantsql.com:5432/etllmjcn'})
module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback)
    },
}
