import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const TugasTags = sequelize.define('master_tugas_tags', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName:true,
  paranoid:true,
}
)


export default TugasTags