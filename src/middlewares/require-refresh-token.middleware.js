import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { REFRESH_TOKEN_SECRET } from "../constants/env.constant.js";
import { prisma } from "../utils/prisma.util.js";

export const requireRefreshToken = async (req, res, next) => {
  try {
    // 1. 인증 정보 파싱
    const authorization = req.headers.authorization;

    // 2. Authorization이 없는 경우
    if (!authorization) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN,
      });
    }

    // 3. Authorization을 type과 token으로 나눈다.
    const [type, refreshToken] = authorization.split(" ");
    // 3-1. JWT 표준 인증 형태(Bearer type)가 아닌 경우
    if (type !== "Bearer") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED,
      });
    }
    // 3-2. RefreshToken이 없는 경우
    if (!refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN,
      });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      // 4. RefreshToken의 유효 기한이 지난 경우
      if (err.name === "TokenExpiredError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.EXPIRED,
        });
      }
      // 5. 그 밖의 RefreshToken 검증에 실패한 경우
      else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.INVALID,
        });
      }
    }
    // 6. RefreshToken이 유효한지 검증
    // 6-1. DB에서 RefreshToken을 조회
    const { userId } = payload;
    const existingRefreshToken = await prisma.refreshToken.findUnique({
      where: { userId: userId },
    });
    // 6-2. DB에 있다면 해당 RefreshToken과 비교
    const isValidRefreshToken =
      existingRefreshToken?.refreshToken &&
      bcrypt.compareSync(refreshToken, existingRefreshToken.refreshToken);
    // 6-3. 유효하지 않다면
    if (!isValidRefreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.DISCARDED_TOKEN,
      });
    }

    // 7. Payload에 담긴 사용자 ID와 일치하는 사용자가 있는지?
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      omit: { password: true },
    });
    // 7-1. 사용자가 없다면?
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_USER,
      });
    }

    // 8. 유저 정보를 request에 담기
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
