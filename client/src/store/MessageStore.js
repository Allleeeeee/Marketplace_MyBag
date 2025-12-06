import { makeAutoObservable } from "mobx";

export default class MessageStore {
    constructor() {
        this._chats = [];
        this._activeChat = null;
        this._messages = [];
        this._isModalOpen = false;
        this._unreadCount = 0;
        makeAutoObservable(this);
    }

    setChats(chats) {
        this._chats = chats;
    }

    setActiveChat(chat) {
        this._activeChat = chat;
    }

    setMessages(messages) {
        this._messages = messages;
    }

    addMessage(message) {
        this._messages.push(message);
    }

    setIsModalOpen(isOpen) {
        this._isModalOpen = isOpen;
    }

    setUnreadCount(count) {
        this._unreadCount = count;
    }

    get chats() {
        return this._chats;
    }

    get activeChat() {
        return this._activeChat;
    }

    get messages() {
        return this._messages;
    }

    get isModalOpen() {
        return this._isModalOpen;
    }

    get unreadCount() {
        return this._unreadCount;
    }
}