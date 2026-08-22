import { Router } from "express";
import {
  addSavedDestination,
  deleteAccount,
  deleteSavedDestination,
  forgotPassword,
  getCurrentUser,
  getSavedDestinations,
  login,
  resetPassword,
  signup,
  updateProfile,
} from "../controller/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.patch("/me", requireAuth, updateProfile);
authRouter.delete("/me", requireAuth, deleteAccount);
authRouter.get("/me/saved-destinations", requireAuth, getSavedDestinations);
authRouter.post("/me/saved-destinations/:cityId", requireAuth, addSavedDestination);
authRouter.delete("/me/saved-destinations/:cityId", requireAuth, deleteSavedDestination);

export default authRouter;
