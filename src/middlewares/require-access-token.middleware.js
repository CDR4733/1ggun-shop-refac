import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { ACCESS_TOKEN_SECRET } from "../constants/env.constant.js";
import { prisma } from "../utils/prisma.util.js";

export const requireAccessToken = async (req, res, next) => {
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
    const [type, accessToken] = authorization.split(" ");
    // 3-1. JWT 표준 인증 형태(Bearer type)가 아닌 경우
    if (type !== "Bearer") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED,
      });
    }
    // 3-2. AccessToken이 없는 경우
    if (!accessToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN,
      });
    }

    let payload;
    try {
      payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    } catch (err) {
      // 4. AccessToken의 유효 기한이 지난 경우
      if (err.name === "TokenExpiredError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.EXPIRED,
        });
      }
      // 5. 그 밖의 AccessToken 검증에 실패한 경우
      else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.INVALID,
        });
      }
    }
    // 6. Payload에 담긴 사용자 ID와 일치하는 사용자가 있는지?
    const { userId } = payload;
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      omit: { password: true },
    });
    // 6-1. 사용자가 없다면?
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_USER,
      });
    }

    // 7. 유저 정보를 request에 담기
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
