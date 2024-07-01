import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Tugas from "../tugas/model.js";
import TugasTags from "../master_tugas_tags/model.js";

const PoolTugasUser = sequelize.define('pool_tugas_tags', {
  tugas_id: {
    type: DataTypes.STRING,
  },
  tag_id: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName:true,
  paranoid:true,
}
)

PoolTugasUser.belongsTo(TugasTags, { foreignKey: 'tag_id' });
TugasTags.hasMany(PoolTugasUser, { foreignKey: 'tag_id' });

PoolTugasUser.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(PoolTugasUser, { foreignKey: 'tugas_id' });

export default PoolTugasUser