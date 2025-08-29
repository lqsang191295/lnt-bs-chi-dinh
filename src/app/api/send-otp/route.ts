import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({
        status: 'error',
        message: 'Phone number is required'
      }, { status: 400 });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Call SMS API
    const smsResult = await sendSmsOtp(otp, phoneNumber);
    
    if (smsResult) {
      return NextResponse.json({
        status: 'success',
        otp: otp, // In production, don't return OTP - store it server-side
        message: 'OTP sent successfully'
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to send OTP'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

async function sendSmsOtp(otp: string, phoneNumber: string) {
  const url = 'http://123.31.36.151:8888/smsbn/api';
  
  const smsData = {
    name: 'send_sms_list',
    REQID: 're12121',
    LABELID: '141121',
    CONTRACTTYPEID: '1',
    CONTRACTID: '13028',
    TEMPLATEID: '927969',
    PARAMS: [
      {
        NUM: '1',
        CONTENT: otp,
      },
    ],
    SCHEDULETIME: '',
    MOBILELIST: '84' + phoneNumber.replace(/^0/, ''),
    ISTELCOSUB: '0',
    AGENTID: '181',
    APIUSER: 'BV-L.N.TUNG',
    APIPASS: 'Abc@123',
    USERNAME: 'BV-L.N.TUNG',
    DATACODING: '8',
  };

  const requestData = {
    RQST: smsData,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const result = await response.json();
      // console.log('SMS API response:', result);
      return result;
    } else {
      // console.error('SMS API failed with status:', response.status);
      return null;
    }
  } catch (error) {
    // console.error('SMS API error:', error);
    return null;
  }
}