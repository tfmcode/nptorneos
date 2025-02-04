import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  UserInput,
} from "../../api/userService";

// Estado inicial
const initialState = {
  users: [] as User[],
  loading: false,
  error: null as string | null,
};

// Async Thunks (Manejo de peticiones asincrónicas con Redux Toolkit)
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  return await getUsers();
});

export const createOrUpdateUser = createAsyncThunk(
  "users/createOrUpdateUser",
  async (userData: UserInput & { _id?: string }) => {
    if (userData._id) {
      return await updateUser(userData._id, userData);
    } else {
      return await createUser(userData);
    }
  }
);

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (id: string) => {
    await deleteUser(id);
    return id;
  }
);

// Slice de usuarios
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
        state.error = "Error al obtener usuarios.";
      })
      .addCase(createOrUpdateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        if (!updatedUser || !updatedUser._id) return;

        const existingIndex = state.users.findIndex(
          (u) => u._id === updatedUser._id
        );

        if (existingIndex !== -1) {
          // ✅ Si el usuario existe, lo reemplazamos completamente en Redux
          state.users[existingIndex] = updatedUser;
        } else {
          // ✅ Si es un usuario nuevo, lo agregamos a la lista
          state.users.push(updatedUser);
        }
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
