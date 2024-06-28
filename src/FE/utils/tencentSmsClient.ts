import { Client } from 'tencentcloud-sdk-nodejs-sms/tencentcloud/services/sms/v20210111/sms_client';

export class TencentSms {
  client: Client;
  constructor(secretId: string, secretKey: string) {
    this.client = new Client({
      credential: {
        secretId,
        secretKey,
      },
      region: 'ap-guangzhou',
    });
  }

  sendSmsAsync = async (params: SendSms) => {
    return await this.client.SendSms({
      SmsSdkAppId: params.smsSdkAppId,
      SignName: params.signName,
      TemplateId: params.templateId,
      PhoneNumberSet: params.phoneNumberSet,
      TemplateParamSet: params.templateParamSet,
    });
  };
}

interface SendSms {
  smsSdkAppId: string;
  signName: string;
  templateId: string;
  phoneNumberSet: string[];
  templateParamSet: string[];
}

export default TencentSms;
