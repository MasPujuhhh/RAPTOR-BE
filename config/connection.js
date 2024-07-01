import 'dotenv/config'
import Sequelize from "sequelize" 

const sequelize = new Sequelize(
   
   process.env.DB_NAME,
   process.env.DB_USER,
   process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging:true,
      port:process.env.DB_PORT,
      timezone:"Asia/Jakarta"
    }
  );

sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

export default sequelize