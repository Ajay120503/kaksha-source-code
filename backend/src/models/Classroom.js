const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  name:String,
  description:String,
  code: {
    type: String, unique: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId, ref: "User"
    }
  ],
   bannedStudents: [
     {
       type: mongoose.Schema.Types.ObjectId, ref: "User"
     }
    ],
});

module.exports = mongoose.model("Classroom",classroomSchema);
