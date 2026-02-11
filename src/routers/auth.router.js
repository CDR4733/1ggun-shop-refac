import express from "express";
import bcrypt from "bcrypt";
import { HASH_SALT_ROUNDS } from "../constants/env.constant.js";

import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { prisma } from "../utils/prisma.util.js";

import { signUpValidator } from "../middlewares/validators/sign-up.validator.js";

const authRouter = express.Router();

/** 회원가입 API **/
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    // 1. 정보 넘겨 받기
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

export { authRouter };
