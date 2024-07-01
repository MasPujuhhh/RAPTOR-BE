import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Tugas from "../tugas/model.js";
import User from "../master_user/model.js";

const PoolTugasUser = sequelize.define('pool_tugas_user', {
  tugas_id: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.STRING,
  },
  
}, {
  freezeTableName:true,
  paranoid:true,
}
)

PoolTugasUser.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PoolTugasUser, { foreignKey: 'user_id' });

PoolTugasUser.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(PoolTugasUser, { foreignKey: 'tugas_id' });


export default PoolTugasUser