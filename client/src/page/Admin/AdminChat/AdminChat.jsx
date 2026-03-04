import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";
import { useGetListChat } from "@/hooks/Chat/useGetListChat";
import { SendHorizontal } from "lucide-react";
import { ChatNotifyStore } from "@/store/ChatNotifyStore/ChatNotifyStore";
import { useLocation } from "react-router";

export const AdminChat = () => {
    const location = useLocation();
    const name = location.pathname.split("/").pop()
    const [roomId, setRoomId] = useState("");
    const [rooms, setRooms] = useState({});
    const [input, setInput] = useState("");
    const { chats, isLoading } = useGetListChat({ page: 1, limit: 10 });
    console.log(chats, "chatschatschatschatschats")
    useEffect(() => {
        socket.emit("join_admin");
    }, []);
    useEffect(() => {
        if (chats?.data?.data?.messages) {
            const map = {};
            chats.data.data.messages.forEach(c => {
                map[c.user._id] = {
                    ...c,
                    roomId: c.user._id
                };
            });
            setRooms(map);
        }
        console.log(rooms, "roomsroomsmap")
    }, [chats]);
    useEffect(() => {
        if (name !== "chat") return;
        const messageHandler = (msg) => {
            console.log(msg, "msgmsgmsgmsg")
            setRooms(prev => {
                const prevRoom = prev[msg.roomId] || {
                    roomId: msg.roomId,
                    messages: [],
                    hasUnread: false
                };
                console.log(prevRoom, "prevRoomprevRoom")
                return {
                    ...prev,
                    [msg.roomId]: {
                        ...prevRoom,
                        messages: [...prevRoom.messages, msg],
                        hasUnread: msg.roomId !== roomId
                    }
                };
            });
        };
        socket.on("message", messageHandler);
        return () => socket.off("message", messageHandler);
    }, []);
    console.log(rooms, "roomsroomsrooms")
    const joinRoom = (id) => {
        setRoomId(id);
        ChatNotifyStore.getState().clearUnread();
        socket.emit("admin_join_room", id);
        setRooms(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                hasUnread: false
            }
        }));
    };
    const send = () => {
        if (!input.trim() || !roomId) return;
        socket.emit("admin_message", {
            roomId,
            message: input
        });
        setInput("");
    };
    const currentRoom = rooms[roomId];
    console.log(currentRoom, "currentRoomcurrentRoom")
    console.log(rooms, "roomsroomsroomsroomsroomsrooms")
    return (
        <div className="relative min-h-screen flex gap-4">
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="loader"></div>
                </div>
            )}
            <div className="w-1/3 border-r">
                <h2 className="font-bold mb-2">Danh sách chat</h2>
                <ul>
                    {Object.values(rooms).map((c) => (
                        <li
                            key={c.user._id}
                            onClick={() => joinRoom(c.roomId)}
                            className={`relative cursor-pointer p-2 border-b hover:bg-gray-100
                              ${roomId === c.roomId ? "bg-gray-200 font-bold" : ""}`}
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src={c.user?.avatar}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                />
                                <span>{c.user?.fullName}</span>
                            </div>
                            <small className="text-gray-400">
                                {c.messages?.[c.messages.length - 1]?.message?.slice(0, 30)}...
                            </small>
                            {c.hasUnread && (
                                <span className="absolute right-2 top-4 w-2.5 h-2.5 bg-red-500 rounded-full" />
                            )}

                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-2/3 flex flex-col">
                <h3 className="font-semibold mb-2">
                    {currentRoom?.userId?.fullName
                        ? `Chat với: ${currentRoom.userId.fullName}`
                        : "Chọn một cuộc trò chuyện"}
                </h3>

                <div className="flex-1 border p-2 max-h-125 overflow-y-auto">
                    {currentRoom?.messages?.map((m, i) => (
                        <div
                            key={i}
                            className={`flex mb-2 ${m.from === "admin"
                                ? "justify-end"
                                : "justify-start items-center gap-2"
                                }`}
                        >
                            {m.from === "customer" && (
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <img
                                        src={currentRoom?.user?.avatar}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div
                                className={`px-3 py-2 rounded-xl max-w-xs wrap-break-word shadow
                                  ${m.from === "admin"
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-secondary text-white rounded-bl-none"
                                    }`}
                            >
                                <p className="text-sm">{m.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {roomId && (
                    <div className="flex gap-2 mt-2">
                        <input
                            className="border flex-1 p-2 rounded-2xl"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button onClick={send} className="text-primary px-4 py-2">
                            <SendHorizontal />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
