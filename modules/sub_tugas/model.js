import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import Tugas from "../tugas/model.js";
import TugasCategory from "../master_tugas_category/model.js";
import User from "../master_user/model.js";

const SubTugas = sequelize.define('sub_tugas', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  tugas_id: {
    type: DataTypes.STRING,
  },
  category_id: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.STRING,
  },
  judul: {
    type: DataTypes.STRING,
  },
  tanggal_selesai: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('ok','dikerjakan','terlambat', ''),
  },
  is_done: {
    type: DataTypes.BOOLEAN,
  },
  alasan: {
    type: DataTypes.STRING,
  },
  
}, {
  freezeTableName:true,
  paranoid:true,
}
)

SubTugas.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SubTugas, { foreignKey: 'user_id' });

SubTugas.belongsTo(TugasCategory, { foreignKey: 'category_id' });
TugasCategory.hasMany(SubTugas, { foreignKey: 'category_id' });

SubTugas.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(SubTugas, { foreignKey: 'tugas_id' });


export default SubTugas