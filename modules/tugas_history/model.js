import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Tugas from "../tugas/model.js";

const TugasHistory = sequelize.define('tugas_history', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  tugas_id: {
    type: DataTypes.STRING,
  },
  keterangan: {
    type: DataTypes.STRING,
  },
  
}, {
  freezeTableName:true,
  paranoid:true,
}
)

TugasHistory.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(TugasHistory, { foreignKey: 'tugas_id' });


export default TugasHistory