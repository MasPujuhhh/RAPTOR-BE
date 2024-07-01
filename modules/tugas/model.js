import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const Tugas = sequelize.define('tugas', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kategori: {
    type: DataTypes.STRING,
  },
  tanggal_mulai: {
    type: DataTypes.DATE,
  },
  tanggal_selesai: {
    type: DataTypes.DATE,
  },
  prioritas: {
    type: DataTypes.STRING,
  },
  is_done: {
    type: DataTypes.BOOLEAN,
  },
  
}, {
  freezeTableName:true,
  paranoid:true,
}
)


export default Tugas