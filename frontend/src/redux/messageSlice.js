import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: []
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  }
});

export const { setMessages, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
