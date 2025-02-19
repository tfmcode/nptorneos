import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, saveUser, deleteUser } from "../../api/userService";
import { User, UserInput } from "../../types/user";

// Estado inicial
const initialState = {
  users: [] as User[],
  loading: false,
  error: null as string | null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  return await getUsers();
});

export const saveUserThunk = createAsyncThunk(
  "users/saveUser",
  async (userData: UserInput & { _id?: string }) => {
    return await saveUser(userData);
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
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al obtener usuarios.";
      })
      .addCase(saveUserThunk.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        if (!updatedUser || !updatedUser._id) return;

        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser; // Actualiza usuario existente
        } else {
          state.users.push(updatedUser); // Agrega usuario nuevo
        }
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
