import * as Clientt from 'tencentcloud-sdk-nodejs-sms/tencentcloud/services/sms/v20210111/sms_client';

const smsClient = Clientt.Client;

const client = new smsClient({
  credential: {
    secretId: process.env.SMS_SECRET_ID,
    secretKey: process.env.SMS_SECRET_KEY,
  },
  region: 'ap-guangzhou',
});

interface SendSms {
  smsSdkAppId: string;
  signName: string;
  templateId: string;
  phoneNumberSet: string[];
  templateParamSet: string[];
}

export const sendSmsAsync = async (params: SendSms) => {
  return await client.SendSms({
    SmsSdkAppId: params.smsSdkAppId,
    SignName: params.signName,
    TemplateId: params.templateId,
    PhoneNumberSet: params.phoneNumberSet,
    TemplateParamSet: params.templateParamSet,
  });
};
