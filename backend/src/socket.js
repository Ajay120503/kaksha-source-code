const Message = require("./models/Message");
const Classroom = require("./models/Classroom");

let onlineUsers = new Map();

const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        /* ================= ONLINE USERS ================= */
        socket.on("userOnline", (userId) => {
            socket.userId = userId;
            onlineUsers.set(userId, socket.id);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });

        socket.on("disconnect", () => {
            for (let [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });

        /* ================= JOIN CLASS ================= */
        socket.on("joinClassroom", (classId) => {
            const roomId = classId.toString();
            socket.join(roomId);
            console.log("User joined room:", classId);
        });

        /* ================= SEND MESSAGE ================= */
        // socket.on("sendMessage", async (data) => {
        //     try {
        //         const { classId, senderId, text, fileUrl, fileType, type } = data;

        //         console.log("📤 Sending message:", classId);

        //         if (!text && !fileUrl) return;

        //         const message = await Message.create({
        //             classId,
        //             sender: senderId,
        //             text,
        //             fileUrl,
        //             fileType,
        //             type: type || "text",
        //         });

        //         const populated = await message.populate("sender", "name");

        //         console.log("📡 Emitting to room:", classId);

        //         io.to(classId).emit("receiveMessage", {
        //             ...populated.toObject(),
        //         });

        //     } catch (err) {
        //         console.error("❌ Send message error:", err.message);
        //     }
        // });

        socket.on("sendMessage", async (data) => {
            try {
                const { classId, senderId, text, fileUrl, fileType, type } = data;

                if (!text && !fileUrl) return;

                const message = await Message.create({
                    classId,
                    sender: senderId,
                    text,
                    fileUrl,
                    fileType,
                    type: type || "text",
                });

                const populated = await message.populate("sender", "name");

                // ================= EMIT MESSAGE =================
                io.to(classId).emit("receiveMessage", {
                    ...populated.toObject(),
                });

                // ================= SEND NOTIFICATION =================
                const classroom = await Classroom.findById(classId)
                    .populate("students", "_id")
                    .populate("teacher", "_id");

                if (!classroom) return;

                let recipients = [];

                // STUDENTS
                classroom.students.forEach((s) => {
                    if (s._id.toString() !== senderId.toString()) {
                        recipients.push({
                            user: s._id,
                            role: "student",
                            read: false,
                        });
                    }
                });

                // TEACHER
                if (
                    classroom.teacher &&
                    classroom.teacher._id.toString() !== senderId.toString()
                ) {
                    recipients.push({
                        user: classroom.teacher._id,
                        role: "teacher",
                        read: false,
                    });
                }

                //console.log("📢 Notification recipients:", recipients);

                // DIRECT CREATE (IMPORTANT)
                await require("./models/Notification").create({
                    title: "New Message",
                    message: `${populated.sender.name} sent a message`,
                    recipients,
                    createdBy: senderId,
                    type: "chat",
                    link: `/chat/${classId}`,
                });

                recipients.forEach((userId) => {
                    const socketId = onlineUsers.get(userId);

                    if (socketId) {
                        io.to(socketId).emit("newNotification", {
                            title: "New Message",
                            message: `${populated.sender.name} sent a message`,
                            classId,
                        });
                    }
                });

            } catch (err) {
                console.error("❌ Send message error:", err.message);
            }
        });
        /* ================= TYPING ================= */
        socket.on("typing", ({ classId, userName }) => {
            socket.to(classId).emit("typing", { userName });
        });

        socket.on("stopTyping", ({ classId }) => {
            socket.to(classId).emit("stopTyping");
        });

        /* ================= EDIT MESSAGE ================= */
        socket.on("editMessage", async ({ messageId, newText, classId }) => {
            try {
                const msg = await Message.findById(messageId);

                if (!msg) return;
                if (msg.sender.toString() !== socket.userId) return;
                if (msg.type !== "text") return;

                msg.text = newText;
                msg.isEdited = true;

                await msg.save();

                const updated = await msg.populate("sender", "name");

                io.to(classId.toString()).emit("messageEdited", updated);

            } catch (err) {
                console.error("Edit error:", err.message);
            }
        });

        /* ================= DELETE MESSAGE ================= */
        socket.on("deleteMessage", async ({ messageId, classId }) => {
            const msg = await Message.findById(messageId);

            if (!msg) return;
            if (msg.sender.toString() !== socket.userId) return;

            msg.isDeleted = true;
            msg.text = "Message deleted";
            msg.fileUrl = null;
            msg.fileType = null;
            msg.type = "text";

            await msg.save();

            const updated = await msg.populate("sender", "name");

            io.to(classId).emit("messageDeleted", {
                ...updated.toObject(),
            });
        });
    });
};

module.exports = setupSocket;