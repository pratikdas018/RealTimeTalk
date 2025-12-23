import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload; // ✅ ONLY array
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload); // ✅ append safely
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateSeenMessages: (state, action) => {
      const receiverId = action.payload;
      state.messages = state.messages.map(msg =>
        msg.receiver === receiverId ? { ...msg, seen: true } : msg
      );
    }

  },
});

export const { setMessages, addMessage, clearMessages, updateSeenMessages } = messageSlice.actions;
export default messageSlice.reducer;
