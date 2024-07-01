import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const ReportLabel = sequelize.define('master_report_label', {
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


export default ReportLabel