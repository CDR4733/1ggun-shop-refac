import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  HASH_SALT_ROUNDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constants/env.constant.js";
import { ACCESS_TOKEN_EXPIRES_IN } from "../constants/auth.constant.js";

import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { prisma } from "../utils/prisma.util.js";

import { signUpValidator } from "../middlewares/validators/sign-up.validator.js";
import { logInValidator } from "../middlewares/validators/log-in.validator.js";

const authRouter = express.Router();

/** 회원가입 API **/
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    // 1. 데이터
    const { email, password, name } = req.body;

    // 2. 중복 검사
    const isExistingEmail = await prisma.user.findUnique({ where: { email } });
    // 2-1. 중복인 경우 에러메시지
    if (isExistingEmail) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: HTTP_STATUS.CONFLICT,
        message: MESSAGES.AUTH.SIGN_UP.FAIL.EMAIL.DUPLICATED,
      });
    }

    // 3. 비밀번호 hash
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    // 4. DB에서 회원가입
    const data = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
      },
    });

    // 5. 결과 반환
    data.password = undefined;
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 로그인 API **/
authRouter.post("/log-in", logInValidator, async (req, res, next) => {
  try {
    // 1. 데이터
    const { email, password } = req.body;

    // 2. 해당 유저가 존재하는지 확인
    const user = await prisma.user.findUnique({ where: { email: email } });

    // 3. 입력된 비밀번호가 DB에 저장된 비밀번호와 일치하는지 확인
    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    // 4. 유저가 존재하지 않거나 비밀번호가 틀린 경우(401)
    if (!isPasswordMatched) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.LOG_IN.FAIL.UNAUTHORIZED,
      });
    }

    // 5. payload
    const payload = { userId: user.userId };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // 6. 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.LOG_IN.SUCCEED,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
});

export { authRouter };
