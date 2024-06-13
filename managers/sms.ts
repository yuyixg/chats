import { SmsExpirationSeconds, generateUniqueCode } from '@/utils/common';
import tencentSms from '@/utils/tencentSmsClient';

import { GlobalConfigKeys, TencentSmsConfig } from '@/types/config';
import { SmsStatus, SmsType } from '@/types/user';

import { ConfigsManager } from './configs';

import prisma from '@/prisma/prisma';

export class SmsManager {
  static verifyUserSignInCode = async (
    phone: string,
    code: string,
    type: SmsType,
  ) => {
    const sms = await prisma.sms.findFirst({
      where: {
        code,
        signName: phone,
        type,
        status: SmsStatus.WaitingForVerification,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!sms) return null;
    const createdAt = new Date(sms.createdAt);
    createdAt.setMinutes(createdAt.getMinutes() + SmsExpirationSeconds / 60);
    return createdAt.getTime() > new Date().getTime() ? sms : null;
  };

  static sendSignInCode = async (phone: string, type: SmsType) => {
    const code = generateUniqueCode();
    await prisma.sms.create({
      data: {
        code,
        signName: phone,
        status: SmsStatus.WaitingForVerification,
        type,
      },
    });
    const tencentSmsConfig: TencentSmsConfig = await ConfigsManager.get(
      GlobalConfigKeys.tencentSms,
    );
    const { secretId, secretKey, sdkAppId, signName, templateId } =
      tencentSmsConfig;
    await new tencentSms(secretId, secretKey).sendSmsAsync({
      phoneNumberSet: [phone],
      smsSdkAppId: sdkAppId!,
      signName: signName!,
      templateId: templateId!,
      templateParamSet: [code],
    });
  };

  static updateStatusToVerified = async (id: string) => {
    await prisma.sms.update({
      where: { id },
      data: { status: SmsStatus.Verified },
    });
  };

  static findBySignName = async (type: SmsType, signName: string) => {
    return await prisma.sms.findFirst({
      where: { signName, type, status: SmsStatus.WaitingForVerification },
      orderBy: { createdAt: 'desc' },
    });
  };
}
