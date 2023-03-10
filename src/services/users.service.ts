import * as J from 'joi';
import { Request, Response } from 'express';
import { UserLogInRequest, UserSignUpRequest } from 'interfaces/user.interface';
import { EntityManager } from 'typeorm';
import { Roles, User } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { AuthRequest } from '../interfaces/token.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { generateJWT, hashPassword, passwordMatch } from '../utils/encryption';

// In MVC this could be a Model
export default class UsersService {
    /**
     * Signs Up a user with the required information
     * and return a jwt to authenticate further requests
     * @param req http request
     * @param res http server response
     */
    register = async (req: AuthRequest, res: Response): Promise<void> => {
        const signUpValidationSchema = J.object({
            name: J.string().optional(),
            email: J.string().email().required(),
            password: J.string().min(10).alphanum().required(),
            passwordConfirmation: J.string().min(10).alphanum().required(),
            role: J.string()
                .valid(...Object.values(Roles))
                .required(),
        });
        return authMiddleware(req, res, {
            bodyValidation: signUpValidationSchema,
            validateToken: false,
            handler: async (req: Request, res: Response, manager: EntityManager) => {
                const { name, email, password, passwordConfirmation, role }: UserSignUpRequest = req.body;

                // validates password
                if (password !== passwordConfirmation) throw new HttpError(400, 'Passwords dont match');

                const existingUser = await manager.findOne(User, { where: { email } });

                if (existingUser) {
                    throw new HttpError(409, `A user with the email ${email} already exists`);
                }

                const hashPass = await hashPassword(password);
                let newUser = new User(name ? name.trim() : null, email.toLowerCase(), hashPass, role);
                newUser = await manager.save(newUser);

                return res.status(201).send({
                    token: generateJWT(newUser),
                    email: newUser.email,
                    role: newUser.role,
                });
            },
        });
    };

    /**
     * Logs In a client and return a jwt to authenticate further requests
     * @param req http request
     * @param res http server response
     */
    logIn = async (req: AuthRequest, res: Response) => {
        const logInValidationSchema = J.object({
            email: J.string().email().required(),
            password: J.string().min(10).alphanum().required(),
        });
        return authMiddleware(req, res, {
            bodyValidation: logInValidationSchema,
            validateToken: false,
            handler: async (req: Request, res: Response, manager: EntityManager) => {
                const { email, password }: UserLogInRequest = req.body;

                let user = await manager.findOne(User, {
                    where: { email: email.toLowerCase() },
                });

                if (!user) {
                    throw new HttpError(404, `User does not exist`);
                }

                passwordMatch(password, user.password);

                res.send({
                    token: generateJWT(user),
                    email: user.email,
                });
            },
        });
    };
}
