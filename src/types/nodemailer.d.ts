declare module "nodemailer" {
  interface TransportOptions {
    service?: string;
    auth?: {
      user: string;
      pass: string;
    };
  }

  interface SendMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
  }

  interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}
