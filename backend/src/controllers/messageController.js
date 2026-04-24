const Message = require("../models/Message");

/* GET ALL MESSAGES */
exports.getMessages = async (req, res) => {
  const { classId } = req.params;

  const messages = await Message.find({ classId })
    .populate("sender", "name")
    .sort({ createdAt: 1 });

  res.json(messages);
};

/* DELETE MESSAGE (API fallback) */
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  const msg = await Message.findById(id);

  msg.isDeleted = true;
  msg.text = "Message deleted";

  await msg.save();

  res.json({ msg: "Deleted" });
};

/* EDIT MESSAGE */
exports.editMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const msg = await Message.findById(id);

  msg.text = text;
  msg.isEdited = true;

  await msg.save();

  res.json(msg);
};