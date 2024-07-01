import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const TugasCategory = sequelize.define('master_tugas_category', {
  // Model attributes are defined here
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  freezeTableName:true,
  paranoid:true,
}
)


export default TugasCategory