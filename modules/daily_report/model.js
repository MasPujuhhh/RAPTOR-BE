import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

import UserModel from "../master_user/model.js";
import Tugas from "../tugas/model.js";
import ReportLabel from "../master_report_label/model.js";

// class User extends Model {}
const DailyReport = sequelize.define('daily_report', {
        // Model attributes are defined here
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING,
        },
        tugas_id: {
          type: DataTypes.STRING,
        },
        label_id: {
          type: DataTypes.STRING,
        },
        jadwal: {
          type: DataTypes.DATE
        },
        deskripsi: {
          type: DataTypes.TEXT
        }
      }, {
        freezeTableName:true,
        paranoid:true,
      }
)

DailyReport.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasMany(DailyReport, { foreignKey: 'user_id' });

DailyReport.belongsTo(Tugas, { foreignKey: 'tugas_id' });
Tugas.hasMany(DailyReport, { foreignKey: 'tugas_id' });

DailyReport.belongsTo(ReportLabel, { foreignKey: 'label_id' });
ReportLabel.hasMany(DailyReport, { foreignKey: 'label_id' });

export default DailyReport