import { SmsExpirationSeconds, generateUniqueCode } from '@/utils/common';
import { sendSmsAsync } from '@/utils/tencentSmsClient';

import { SmsStatus, SmsType } from '@/types/user';

import prisma from '@/prisma/prisma';

export class SmsManager {
  static verifyUserSignInCode = async (phone: string, code: string) => {
    const sms = await prisma.sms.findFirst({
      where: {
        code,
        signName: phone,
        type: SmsType.SignIn,
        status: SmsStatus.WaitingForVerification,
      },
    });
    if (!sms) return null;
    const createAt = new Date(sms.createdAt);
    createAt.setMinutes(createAt.getMinutes() + SmsExpirationSeconds / 60);
    return sms.createdAt > new Date() ? sms : null;
  };

  static sendSignInCode = async (phone: string) => {
    const code = generateUniqueCode();
    await prisma.sms.create({
      data: {
        code,
        signName: phone,
        status: SmsStatus.WaitingForVerification,
        type: SmsType.SignIn,
      },
    });
    const { SMS_SDK_APP_ID, SMS_SIGN_NAME, SMS_TEMPLATE_ID } = process.env;
    await sendSmsAsync({
      phoneNumberSet: [phone],
      signName: SMS_SIGN_NAME!,
      smsSdkAppId: SMS_SDK_APP_ID!,
      templateId: SMS_TEMPLATE_ID!,
      templateParamSet: [code],
    });
  };

  static updateStatusToVerified = async (id: string) => {
    await prisma.sms.update({
      where: { id },
      data: { status: SmsStatus.Verified },
    });
  };
}
