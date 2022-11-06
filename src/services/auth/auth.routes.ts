import { Request, Response, Router } from "express";
import { createNewUser, loginUser } from "./auth.service";
import { UserDetailsDto } from "./dtos/userdetails.dto";
import { body, validationResult } from "express-validator";

const authRouter = Router();

authRouter.post(
  "/create-account",
  body("Email").isEmail(),
  body("Password").isStrongPassword(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = await createNewUser(req.body as UserDetailsDto);
    if (!!token) {
      return res.status(201).json({ token });
    }

    return res.status(403).json({ message: "unable to create account" });
  }
);

authRouter.post("/login", body("Email").isEmail(), body("Password").isString(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const token = await loginUser(req.body as UserDetailsDto);
  if (!!token) {
    return res.status(201).json({ token });
  }

  return res.status(403).json({ message: "invalid email or password supplied" });
});

export { authRouter };
