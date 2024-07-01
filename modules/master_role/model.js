import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";



const Role = sequelize.define('master_role', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alias: {
    type: DataTypes.STRING,
  },
  head: {
    type: DataTypes.STRING,
  },
}, {
  freezeTableName:true,
  paranoid:true,
}
)

export default Role