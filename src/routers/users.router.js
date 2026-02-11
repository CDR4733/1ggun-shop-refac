import express from "express";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

const usersRouter = express.Router();

/** 내 정보 조회(R-D) API **/
usersRouter.get("/me", requireAccessToken, async (req, res, next) => {
  try {
    const data = req.user;

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.USERS.READ.ME.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

export { usersRouter };
