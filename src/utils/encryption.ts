import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { DecodedToken } from '../interfaces/token.interface';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const passwordMatch = (inputPassword: string, hashedPassword: string) => {
    if (!bcrypt.compareSync(inputPassword, hashedPassword)) {
        throw new HttpError(400, 'Password does not match');
    }
};

export const generateJWT = (user: User): string => {
    const superSecretKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQDZnTCMMH7qOoGxTRdjxc24nCd+BYUWYc6czU2CX3Q8LVo5NCNW
urOeNvVqi63BnO/S+5x8Vh04CZRK9Pz3LP/5xP/SrurC+YbQ9ELzoxX74aZ0Ut10
V5aK5Zcu5TZVnZqDld6bkUnBk6NDGe9V2FK50Mady0U7c8sO0jrvj3uzcwIDAQAB
AoGBAIoa8EyIGoOcTeKwAkAXsM+Qip+38RabS/zHboFnAuWOAsx7AlJwer3WMzpD
Gyrc5ncHp/Bg1npR2gMYJ9LWhDxbyJgj+FoITX5c+Bq3sGN2oQldflxG9itM9Aua
WPaJizZl6LeQN0IGsS8g4uC4VBieV7uBXvIdIZKAOq4UfwaBAkEA80ME0njW/fND
Zw0DF+pgsuq+YfehN0Dp1inM2N/tnrcXMFyFIdo2sGATsy2mEuoyuuYjmEZ0YhMU
9kPkhrL6OQJBAOUCW0BAfzT+UGFMP1RMLw6Z1V2F/gfyDSwwBreqWvsWCvF0UOCy
DWMSAfCd7aV4kvyQsmAiKO8H5SrQ5G9eiwsCQEoHUyhZ7dNKfHCX3SEiCltoZJeb
rEwMTR0Hi3dUbhOm1D+7aChtJ8d09YnJkoifDOEjuCFXD4PpGq/26Uy0msECQQCV
FTuiUFp/fS+Gp8RydEYOE0c7YwdE1OaOZZV564TfADKPjVE5dbARVp+8rJMQrbXC
hdAZlSNguJsPjH2porqRAkEAl43oh1I6VSMoEcq+hj6tlYwlQxDJda402f6WMbyY
svvtVFOHxmoO3HSjXTXYfOi1nx9lMFYjZ43MV0ZyaM3SdA==
-----END RSA PRIVATE KEY-----`;

    const options: jwt.SignOptions = { algorithm: 'RS256' };
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        superSecretKey,
        options,
    );
    return token;
};

export const decodeToken = (token: string): DecodedToken => {
    const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZnTCMMH7qOoGxTRdjxc24nCd+
BYUWYc6czU2CX3Q8LVo5NCNWurOeNvVqi63BnO/S+5x8Vh04CZRK9Pz3LP/5xP/S
rurC+YbQ9ELzoxX74aZ0Ut10V5aK5Zcu5TZVnZqDld6bkUnBk6NDGe9V2FK50Mad
y0U7c8sO0jrvj3uzcwIDAQAB
-----END PUBLIC KEY-----`;

    const publicKeyBuffer = Buffer.from(publicKey, 'utf-8');
    const decoded: any = jwt.verify(token, publicKeyBuffer);

    return {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp,
    };
};
