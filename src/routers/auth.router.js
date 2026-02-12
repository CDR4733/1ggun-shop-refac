import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  HASH_SALT_ROUNDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constants/env.constant.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../constants/auth.constant.js";

import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { prisma } from "../utils/prisma.util.js";

import { signUpValidator } from "../middlewares/validators/sign-up.validator.js";
import { logInValidator } from "../middlewares/validators/log-in.validator.js";
import { requireRefreshToken } from "../middlewares/require-refresh-token.middleware.js";

const authRouter = express.Router();

/** 회원가입 API **/
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    // 1. Request
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

    // 5. Response
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
    // 1. Request
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

    // 5. payload로 토큰 생성
    const payload = { userId: user.userId };
    const data = await generateAuthToken(payload);

    // 6. Response
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.LOG_IN.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 로그아웃 API **/
authRouter.post("/log-out", requireRefreshToken, async (req, res, next) => {
  try {
    // 1. Request
    const user = req.user;

    // 2. DB에서 해당 user의 refresh token 삭제
    await prisma.refreshToken.delete({ where: { userId: user.userId } });

    // 3. Response
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.LOG_OUT.SUCCEED,
      data: {
        userId: user.userId,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** 토큰 재발급 API **/
authRouter.post("/re-token", requireRefreshToken, async (req, res, next) => {
  try {
    // 1. Request
    const user = req.user;

    // 2. payload로 토큰 재발급
    const payload = { userId: user.userId };
    const data = await generateAuthToken(payload);

    // 3. Response
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.COMMON.JWT.RE_TOKEN,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 토큰 생성 함수 **/
const generateAuthToken = async (payload) => {
  // 1. Argument
  const userId = payload.userId;
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  // 2. DB 저장
  // 2-1. refresh token을 hash
  const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUNDS);
  // 2-2. upsert : 있으면 update, 없으면 create
  await prisma.refreshToken.upsert({
    where: {
      userId: userId,
    },
    update: {
      refreshToken: hashedRefreshToken,
    },
    create: {
      userId: userId,
      refreshToken: hashedRefreshToken,
    },
  });

  // 3. Return
  return { accessToken, refreshToken };
};

export { authRouter };
