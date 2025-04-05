import express from "express";
import { registerUser, activateUser, loginUser, logoutUser, updateAccessToken, getUserInfo} from "../controllers/user.controller";
import { isAuthenticated } from "../utils/auth";

const userRouter = express.Router();


userRouter.post("/registration", registerUser);

userRouter.post("/activate-user", activateUser);

userRouter.post("/login", loginUser);

userRouter.post("/logout", isAuthenticated, logoutUser);

userRouter.post("/refresh", updateAccessToken);

userRouter.get("/me", isAuthenticated, getUserInfo);


export default userRouter;