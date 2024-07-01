import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Pengumuman from "../pengumuman/model.js";
import User from "../master_user/model.js";

const PoolPengumumansUser = sequelize.define('pool_pengumuman_user', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
  },
  pengumuman_id: {
    type: DataTypes.STRING,
  },
  is_read:{
    type: DataTypes.BOOLEAN,
  }
}, {
  freezeTableName:true,
  paranoid:true,
}
)

PoolPengumumansUser.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PoolPengumumansUser, { foreignKey: 'user_id' });

PoolPengumumansUser.belongsTo(Pengumuman, { foreignKey: 'pengumuman_id' });
Pengumuman.hasMany(PoolPengumumansUser, { foreignKey: 'pengumuman_id' });

export default PoolPengumumansUser